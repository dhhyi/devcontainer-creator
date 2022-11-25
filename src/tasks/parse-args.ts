import { basename } from 'path';

import { once } from 'lodash-es';

import { DCC_PROTOCOL, simpleImageReference } from '../constants';

import { TmpOutputDir } from './create-tmp-dir';

function printUsageAndExit() {
  console.log(
    `Usage: node ${basename(process.argv[1])} <language.yaml> <target-folder>`
  );
  process.exit(1);
}

export const VERBOSE = process.argv.includes('--verbose');

export const ParsedArgs = once(() => {
  if (process.argv.length < 4) {
    printUsageAndExit();
  }

  const argv = process.argv.slice(2);

  const languageYaml = argv[0];
  let targetDir = argv[1];

  let extraArgs = argv.slice(2);
  if (targetDir === '--test') {
    extraArgs = argv.slice(1);
    targetDir = TmpOutputDir();
  } else if (targetDir.startsWith('-')) {
    printUsageAndExit();
  }

  const fullDevcontainer = extraArgs.includes('--full');
  const devcontainerNameArg = extraArgs.findIndex((arg) => arg === '--name');
  const devcontainerName =
    devcontainerNameArg >= 0 && extraArgs[devcontainerNameArg + 1];
  const test = extraArgs.includes('--test');
  const tagArg = extraArgs.findIndex((arg) => arg === '--tag');
  const tag = tagArg >= 0 && extraArgs[tagArg + 1];
  const dumpMeta = extraArgs.includes('--dump-meta');
  const build = extraArgs.includes('--build') || test || tag;
  const cacheFromArg = extraArgs.findIndex((arg) => arg === '--cache-from');
  const cacheFrom = cacheFromArg >= 0 && extraArgs[cacheFromArg + 1];

  let simpleImage = '';
  if (languageYaml.startsWith(DCC_PROTOCOL) && !fullDevcontainer) {
    const lang = languageYaml.substring(DCC_PROTOCOL.length);
    simpleImage = simpleImageReference(lang);
  }

  return {
    languageYaml,
    targetDir,
    simpleImage,
    fullDevcontainer,
    devcontainerName,
    build,
    cacheFrom,
    test,
    tag,
    dumpMeta,
  };
});
