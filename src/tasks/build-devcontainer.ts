import { execSync } from 'child_process';

import { memoize, once } from 'lodash-es';

import { baseImageReference, DCC_PROTOCOL } from '../constants';
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

async function resolveImageTag(): Promise<string | undefined>;
async function resolveImageTag(defaultName: string): Promise<string>;
async function resolveImageTag(defaultName?: string) {
  const { tag } = ParsedArgs();
  if (tag) {
    return tag;
  } else {
    const resolvedYaml = await ResolvedYaml();
    const tagFromPublish = resolvedYaml?.devcontainer?.publish?.image;
    if (tagFromPublish?.startsWith(DCC_PROTOCOL)) {
      return baseImageReference(tagFromPublish);
    }
    return tagFromPublish || defaultName;
  }
}

async function buildWithDevcontainerCli(): Promise<string> {
  const { cacheFrom, targetDir } = ParsedArgs();
  const tag = await resolveImageTag();

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

export const BuildDevcontainer = once(async () => {
  const image = await buildWithDevcontainerCli();
  const dccMeta = await ConstructedDCCMeta();
  if (dccMeta) {
    appendMetaToImage(image, dccMeta);
  }

  logPersist('built image', image);

  return image;
});
