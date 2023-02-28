import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

import { once } from 'lodash-es';

import { logError, logStatus } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';

function installTool(tool: string, version: string, toolBin: string) {
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

export const GomplateBin = once(() => {
  const baseDir = installTool('gomplate', 'latest', 'node_modules/gomplate');

  // trigger go-npm
  const output = execSync('npm run postinstall', {
    cwd: baseDir,
    encoding: 'utf-8',
  });

  const regex = /^Placed binary on (.*)$/gm;
  const globalInstallPath = regex.exec(output)?.[1];

  if (!globalInstallPath) {
    throw new Error('Could not find global install path for gomplate');
  }

  return globalInstallPath;
});

export const DevcontainerCLIBin = once(() => {
  return installTool(
    '@devcontainers/cli',
    '0.29.0',
    'node_modules/.bin/devcontainer'
  );
});
