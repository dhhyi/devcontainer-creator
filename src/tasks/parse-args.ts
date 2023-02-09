import { basename } from 'path';

import getopts from 'getopts';
import { once } from 'lodash-es';

import { DCC_PROTOCOL } from '../constants';

import { TmpOutputDir } from './create-tmp-dir';

function printUsageAndExit() {
  console.log(
    `Create a devcontainer.

Usage: node ${basename(process.argv[1])} language-spec [target-folder] [options]

language-spec: Path to a language specification YAML file, or a URL to a language specification YAML file. If the argument starts with "${DCC_PROTOCOL}", the language specification will be downloaded from the repositories example folder (i.e ${DCC_PROTOCOL}lua).

target-folder: Path to the target folder. If not specified, a temporary folder will be used.

Options:
  --name\tName of the devcontainer.

  --build\tBuild the devcontainer after creation.
  --tag\t\tTag of the devcontainer image.
  --cache-from\tImage to use as cache for the devcontainer image.

  --test\tTest the devcontainer after creation.
  --dump-meta\tDump the metadata of the devcontainer.
  --no-vscode\tDo not create a .vscode folder.

  -v, --verbose\tVerbose output.
  -vv, --debug\tDebug output.

  -h, --help\tPrint this help message.

Examples:
  node ${basename(process.argv[1])} ${DCC_PROTOCOL}lua .
    Create a devcontainer for Lua in the current folder.

  node ${basename(process.argv[1])} language.yaml --test
    Create and test a temporary devcontainer for the
    language specified in language.yaml.
`
  );
  process.exit(1);
}

export const VERY_VERBOSE =
  process.argv.includes('--debug') || process.argv.includes('-vv');

export const VERBOSE =
  VERY_VERBOSE ||
  process.argv.includes('--verbose') ||
  process.argv.includes('-v');

interface CmdlArguments {
  languageYaml: string;
  targetDir: string;

  devcontainerName?: string;

  build?: boolean;
  tag?: string;
  cacheFrom?: string;

  test?: boolean;
  run?: boolean;

  vscode?: boolean;
  dumpMeta?: boolean;
}

export const ParsedArgs: () => CmdlArguments = once(() => {
  const options = getopts(process.argv.slice(2), {
    string: ['name', 'cache-from', 'tag'],
    boolean: [
      'build',
      'test',
      'run',
      'dump-meta',
      'vscode',
      'v',
      'verbose',
      'debug',
    ],
    default: {
      vscode: true,
    },
    unknown: (arg) => {
      if (arg !== 'help' && arg !== '-h') {
        console.log(`Unknown option: ${arg}`);
      }
      printUsageAndExit();
      return false;
    },
  });

  const defaultArgs = options._;
  if (defaultArgs.length === 0) {
    printUsageAndExit();
  }

  const languageYaml = defaultArgs[0];
  const targetDir = defaultArgs[1] || TmpOutputDir();

  return {
    languageYaml,
    targetDir,
    devcontainerName: options.name,
    build: !!options.build,
    tag: options.tag,
    cacheFrom: options['cache-from'],
    test: !!options.test,
    run: !!options.run,
    dumpMeta: !!options['dump-meta'],
    vscode: !!options.vscode,
  };
});
