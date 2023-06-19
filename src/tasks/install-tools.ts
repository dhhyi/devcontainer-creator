import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

import { once } from 'lodash-es';

import { logError, logStatus } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';

function installTool(tool: string, toolBin: string, version = 'latest') {
  const toolPath = join(TmpWorkingDir(), toolBin);
  if (existsSync(toolPath)) {
    logStatus('found already installed', tool);
  } else {
    try {
      logStatus('installing', tool);
      execSync(`npm exec pnpm -- install --prefer-offline ${tool}@${version}`, {
        stdio: 'ignore',
        cwd: TmpWorkingDir(),
      });
    } catch (error) {
      logError('error installing tool:', (error as Error).message);
      process.exit(1);
    }
  }
  return toolPath;
}

export const DevcontainerCLIBin = once(() => {
  return installTool('@devcontainers/cli', 'node_modules/.bin/devcontainer');
});