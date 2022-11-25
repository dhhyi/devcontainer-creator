import { execSync } from 'child_process';
import { join } from 'path';

import { once } from 'lodash-es';

import { logError, logStatus } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';

function installTool(tool: string) {
  try {
    logStatus('installing', tool);
    execSync(`npm exec pnpm -- install --prefer-offline ${tool}`, {
      stdio: 'ignore',
      cwd: TmpWorkingDir(),
    });
  } catch (error) {
    logError('error installing tool:', (error as Error).message);
    process.exit(1);
  }
}

export const GomplateBin = once(() => {
  installTool('gomplate');
  return join(
    TmpWorkingDir(),
    'node_modules/gomplate/node_modules/.bin/gomplate'
  );
});

export const DevcontainerCLIBin = once(() => {
  installTool('@devcontainers/cli');
  return join(TmpWorkingDir(), 'node_modules/.bin/devcontainer');
});

export const AjvCLIBin = once(() => {
  installTool('ajv-cli');
  return join(TmpWorkingDir(), 'node_modules/.bin/ajv');
});
