import { execSync } from 'child_process';

import { once } from 'lodash-es';

const INSTALL_LATEST_MESSAGE =
  'please install devcontainer-cli with `npm install -g @devcontainers/cli@latest`';

function isSemVerLessThan(left: string, right: string) {
  const partsLeft = left.split('.');
  const partsRight = right.split('.');
  for (let i = 0; i < 3; i++) {
    const numLeft = Number(partsLeft[i]);
    const numRight = Number(partsRight[i]);
    if (numLeft > numRight) {
      return false;
    }
    if (numRight > numLeft) {
      return true;
    }
    if (!isNaN(numLeft) && isNaN(numRight)) {
      return false;
    }
    if (isNaN(numLeft) && !isNaN(numRight)) {
      return true;
    }
  }
  return false;
}

export const DevcontainerCLIBin = once(() => {
  try {
    const version = execSync('devcontainer --version', {
      encoding: 'utf-8',
    }).trim();
    if (isSemVerLessThan(version, '0.51.2')) {
      throw new Error(
        'minimum required devcontainer-cli version is 0.51.2, got ' + version
      );
    }
  } catch (error) {
    console.log('\n');
    console.error(
      'error getting devcontainer version:',
      (error as Error).message
    );
    console.log(INSTALL_LATEST_MESSAGE);
    process.exit(1);
  }

  return 'devcontainer';
});
