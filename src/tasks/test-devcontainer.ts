import { execSync, spawnSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { once } from 'lodash-es';

import { logError, logPersist } from '../logging';

import { BuildDevcontainer } from './build-devcontainer';
import { TmpWorkingDir } from './create-tmp-dir';
import { DevcontainerCLIBin } from './install-tools';
import { VERBOSE } from './parse-args';

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

  if (VERBOSE) {
    logPersist('executing', DevcontainerCLIBin(), ...devcontainerUpArgs);
  }

  logPersist('testing devcontainer');
  const devcontainerUp = spawnSync(DevcontainerCLIBin(), devcontainerUpArgs);

  if (VERBOSE) {
    logPersist(devcontainerUp.stderr.toString());
  }

  if (devcontainerUp.status !== 0) {
    logError('error starting devcontainer');
    if (!VERBOSE) {
      logPersist(devcontainerUp.stderr.toString());
    }
    process.exit(1);
  }

  const containerId = JSON.parse(devcontainerUp.stdout.toString()).containerId;

  const devcontainerTestArgs = [
    'exec',
    '--workspace-folder',
    testingTmpDir,
    '/selftest.sh',
  ];

  if (VERBOSE) {
    logPersist('executing', DevcontainerCLIBin(), ...devcontainerTestArgs);
  }

  try {
    execSync(`${DevcontainerCLIBin()} ${devcontainerTestArgs.join(' ')}`, {
      stdio: 'inherit',
    });
  } catch (error) {
    logError('error testing devcontainer');
    process.exit(1);
  } finally {
    execSync(`docker rm -f ${containerId}`, {
      stdio: 'ignore',
    });
  }
});
