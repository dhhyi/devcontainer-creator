import { execSync } from 'child_process';

import { memoize, once } from 'lodash-es';

import { resolveImageReference } from '../constants';
import { execute } from '../exec';
import { logPersist } from '../logging';

import { DevcontainerCLIBin } from './check-tools';
import { appendMetaToImage, ConstructedDCCMeta } from './devcontainer-meta';
import { ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';

export const PulledImage: (image: string, fail?: boolean) => string = memoize(
  (image: string, expectSuccess = false) => {
    if (!image.includes(':')) {
      return PulledImage(`${image}:latest`, expectSuccess);
    } else {
      if (
        !execSync(`docker image ls -q ${image}`, { encoding: 'utf-8' }).trim()
      ) {
        try {
          execute('pulling ' + image, 'docker', ['pull', image]);
        } catch (error) {
          // do nothing
        }
      }
      return image;
    }
  },
  (image, fail) => `${image}:${fail}`
);

async function resolvePublishTag(): Promise<string | undefined> {
  const { tag } = ParsedArgs();
  if (tag) {
    return tag;
  } else {
    const resolvedYaml = await ResolvedYaml();
    const tagFromPublish = resolvedYaml?.devcontainer?.publish?.image;
    if (tagFromPublish) {
      return resolveImageReference(tagFromPublish);
    }
    return tagFromPublish;
  }
}

export function isRegistryTag(tag: string): boolean {
  return tag.includes('/');
}

export function getCacheFrom(tag: string): string {
  return `type=registry,ref=${tag}-cache`;
}

async function buildWithDevcontainerCli(): Promise<string> {
  const { targetDir, tag: argTag, push } = ParsedArgs();

  if (push) {
    await CheckOrCreateBuilder();
  }

  const publishTag = await resolvePublishTag();

  const tag = argTag || publishTag;

  const devcontainerArgs = ['build', '--workspace-folder', targetDir];
  if (tag) {
    devcontainerArgs.push('--image-name', tag);
  }
  if (publishTag && isRegistryTag(publishTag)) {
    devcontainerArgs.push('--cache-from', getCacheFrom(publishTag));
    if (push) {
      devcontainerArgs.push(
        '--cache-to',
        `${getCacheFrom(publishTag)},mode=max`
      );
    }
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

function currentBuildXDriver() {
  const driverRegex = /^Driver:\s+(.*)$/;
  const buildXInspect = execSync('docker buildx inspect', {
    encoding: 'utf-8',
  });
  const driver = buildXInspect.match(driverRegex)?.[1];
  return driver;
}

const CheckOrCreateBuilder = once(async () => {
  if (currentBuildXDriver() !== 'docker-container') {
    const builderName = `dcc-builder-${Date.now()}`;
    execute('creating builder', 'docker', [
      'buildx',
      'create',
      '--name',
      builderName,
      '--driver',
      'docker-container',
      '--use',
    ]);
    process.on('exit', () => {
      execSync(`docker buildx rm ${builderName}`);
    });
  }
});

export const BuildDevcontainer = once(async () => {
  const image = await buildWithDevcontainerCli();
  const dccMeta = await ConstructedDCCMeta();
  if (dccMeta) {
    appendMetaToImage(image, dccMeta);
  }

  logPersist('built image', image);

  return image;
});

export const BuildAndPushDevcontainer = once(async () => {
  const image = await BuildDevcontainer();
  const { tag } = ParsedArgs();
  if (tag && isRegistryTag(tag)) {
    execute('pushing image', 'docker', ['push', tag]);
  }
  return image;
});
