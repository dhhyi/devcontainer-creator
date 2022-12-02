import { mkdtempSync, mkdirSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { once } from 'lodash-es';

import { logStatus } from '../logging';

export const TmpWorkingDir = once(() => {
  const dir = join(tmpdir(), 'devcontainer-creator-' + GIT_REV);
  if (!existsSync(dir)) {
    if (
      !mkdirSync(dir, {
        recursive: true,
      })
    ) {
      throw new Error('failed to create temporary working directory');
    } else {
      logStatus('created working dir', dir);
    }
  } else {
    logStatus('reusing working dir', dir);
  }
  return dir;
});

export const TmpOutputDir = once(() => {
  const dir = mkdtempSync(join(tmpdir(), 'dcc-test-'));
  logStatus('created output dir', dir);
  return dir;
});

export const TmpTestingDir = once(() => {
  const dir = mkdtempSync(join(TmpWorkingDir(), 'testing-'));
  logStatus('created testing dir', dir);
  return dir;
});
