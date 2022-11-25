import { spawnSync } from 'child_process';

import { once } from 'lodash-es';

import { logError, logPersist, logStatus } from '../logging';

import { ConstructedDevcontainerMeta } from './devcontainer-meta';
import { PulledImage } from './docker-pull';
import { DevcontainerCLIBin } from './install-tools';
import { ResolvedYaml } from './language-spec';
import { ParsedArgs, VERBOSE } from './parse-args';

function buildWithDevcontainerCli(): string {
  const { tag, cacheFrom, targetDir } = ParsedArgs();

  const devcontainerArgs = ['build', '--workspace-folder', targetDir];
  if (tag) {
    devcontainerArgs.push('--image-name', tag);
  }

  if (cacheFrom) {
    devcontainerArgs.push('--cache-from', PulledImage(cacheFrom));
  }

  if (VERBOSE) {
    logPersist('executing', DevcontainerCLIBin(), ...devcontainerArgs);
  }

  logStatus('building devcontainer');
  const build = spawnSync(DevcontainerCLIBin(), devcontainerArgs);

  if (VERBOSE) {
    logPersist(build.stderr.toString());
  }

  if (build.status !== 0) {
    logError('error building devcontainer:', build.stderr.toString());
    process.exit(1);
  }

  const devcontainerOutput = JSON.parse(build.stdout.toString());
  const image = devcontainerOutput.imageName[0];
  logPersist('built image', image);

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

  if (VERBOSE) {
    logPersist('executing', 'docker', ...dockerBuildArgs);
  }

  logStatus('building devcontainer');
  const build = spawnSync('docker', dockerBuildArgs);

  if (build.status !== 0) {
    logError(build.stderr.toString());
    process.exit(1);
  }

  if (VERBOSE) {
    logPersist(build.stderr.toString());
  }

  logPersist('built image', image);
  return image;
}

export const BuildDevcontainer = once(async () => {
  if (ParsedArgs().simpleImage) {
    return buildWithDevcontainerCli();
  }

  return await buildWithDocker();
});
