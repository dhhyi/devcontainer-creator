import { once } from 'lodash-es';

import { execute } from '../exec';
import { logPersist } from '../logging';

import { ConstructedDevcontainerMeta } from './devcontainer-meta';
import { PulledImage } from './docker-pull';
import { DevcontainerCLIBin } from './install-tools';
import { ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';

function buildWithDevcontainerCli(): string {
  const { tag, cacheFrom, targetDir } = ParsedArgs();

  const devcontainerArgs = ['build', '--workspace-folder', targetDir];
  if (tag) {
    devcontainerArgs.push('--image-name', tag);
  }
  if (cacheFrom) {
    devcontainerArgs.push('--cache-from', PulledImage(cacheFrom));
  }

  const result = execute(
    'building devcontainer',
    DevcontainerCLIBin,
    devcontainerArgs,
    { response: 'stdout' }
  );

  const devcontainerOutput = JSON.parse(result);
  const image = devcontainerOutput.imageName[0];

  return image;
}

async function buildWithDocker() {
  const resolvedYaml = (await ResolvedYaml()).content;
  const { tag, cacheFrom, targetDir } = ParsedArgs();

  const languageBuildArgs = Object.entries(
    resolvedYaml?.devcontainer?.build?.args || []
  ).reduce<string[]>(
    (acc, [key, value]) => [...acc, '--build-arg', `${key}=${value}`],
    []
  );
  const image = tag || `dcc-${Date.now()}`;

  const dockerBuildArgs: string[] = [
    'build',
    ...languageBuildArgs,
    '--build-arg',
    'BUILDKIT_INLINE_CACHE=1',
    '-t',
    image,
    '--label',
    `devcontainer.metadata=${JSON.stringify(
      await ConstructedDevcontainerMeta()
    )}`,
  ];

  if (cacheFrom) {
    dockerBuildArgs.push('--cache-from', PulledImage(cacheFrom));
  }

  dockerBuildArgs.push(`${targetDir}/.devcontainer`);

  execute('building devcontainer', 'docker', dockerBuildArgs);

  return image;
}

export const BuildDevcontainer = once(async () => {
  let image: string;
  if (ParsedArgs().simpleImage) {
    image = buildWithDevcontainerCli();
  } else {
    image = await buildWithDocker();
  }

  logPersist('built image', image);

  return image;
});
