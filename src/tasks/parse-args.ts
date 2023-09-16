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
  --no-vscode\tDo not create a .vscode folder.
  --no-validate\tDo not validate the language specification.

  --tag\t\tTag of the devcontainer image.

  --build\tBuild the devcontainer after creation.
  --test\tTest the devcontainer after creation.
  --run\t\tRun the devcontainer after creation.
  --push\t\tPush the devcontainer after creation.

  -v, --verbose\tVerbose output.
  -vv, --debug\tDebug output.
  --dump-meta\tDump the metadata of the devcontainer.

  -h, --help\tPrint this help message.

Examples:
  node ${basename(process.argv[1])} ${DCC_PROTOCOL}lua .
    Create a devcontainer for Lua in the current folder.

  node ${basename(process.argv[1])} language.yaml --test
    Create and test a temporary devcontainer for the
    language specified in language.yaml.

  node ${basename(process.argv[1])} ${DCC_PROTOCOL}lua --run
    Create and run a temporary devcontainer for Lua.
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
  push?: boolean;

  test?: boolean;
  run?: boolean;

  vscode?: boolean;
  dumpMeta?: boolean;
  validate?: boolean;
}

export const ParsedArgs: () => CmdlArguments = once(() => {
  const options = getopts(process.argv.slice(2), {
    string: ['name', 'tag'],
    boolean: [
      'build',
      'push',
      'test',
      'run',
      'dump-meta',
      'vscode',
      'v',
      'verbose',
      'debug',
      'validate',
    ],
    default: {
      vscode: true,
      validate: true,
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
    push: !!options.push,
    tag: options.tag,
    test: !!options.test,
    run: !!options.run,
    dumpMeta: !!options['dump-meta'],
    vscode: !!options.vscode,
    validate: !!options.validate,
  };
});
