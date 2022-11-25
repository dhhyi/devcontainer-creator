import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { once } from 'lodash-es';

import { execute } from '../exec';
import { logError } from '../logging';

import { BuildDevcontainer } from './build-devcontainer';
import { TmpWorkingDir } from './create-tmp-dir';
import { DevcontainerCLIBin } from './install-tools';

export const TestDevcontainer = once(async () => {
  const TMP_DIR = TmpWorkingDir();
  const image = await BuildDevcontainer();

  const testingTmpDir = join(TMP_DIR, 'testing');
  mkdirSync(testingTmpDir);
  writeFileSync(
    join(testingTmpDir, '.devcontainer.json'),
    JSON.stringify({ image })
  );

  const devcontainerUpArgs = ['up', '--workspace-folder', testingTmpDir];
  const devcontainerUp = execute(
    'starting devcontainer',
    DevcontainerCLIBin,
    devcontainerUpArgs,
    { response: 'stdout' }
  );

  const containerId = JSON.parse(devcontainerUp).containerId;

  const devcontainerTestArgs = [
    'exec',
    '--workspace-folder',
    testingTmpDir,
    '/selftest.sh',
  ];

  try {
    execute('testing devcontainer\n', DevcontainerCLIBin, devcontainerTestArgs);
  } catch (error) {
    logError('error testing devcontainer');
    process.exit(1);
  } finally {
    execSync(`docker rm -f ${containerId}`, {
      stdio: 'ignore',
    });
  }
});
