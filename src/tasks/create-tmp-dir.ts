import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { once } from 'lodash-es';

import { logStatus } from '../logging';

export const TmpWorkingDir = once(() => {
  const dir = mkdtempSync(join(tmpdir(), 'devcontainer-creator-'));
  logStatus('created working dir', dir);
  return dir;
});

export const TmpOutputDir = once(() => {
  const dir = mkdtempSync(join(tmpdir(), 'dcc-test-'));
  logStatus('created output dir', dir);
  return dir;
});
