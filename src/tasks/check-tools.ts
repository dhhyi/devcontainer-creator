import { execSync } from 'child_process';

import { once } from 'lodash-es';

const INSTALL_LATEST_MESSAGE =
  'please install devcontainer-cli with `npm install -g @devcontainers/cli@latest`';

export const DevcontainerCLIBin = once(() => {
  try {
    const version = execSync('devcontainer --version', {
      encoding: 'utf-8',
    }).trim();
    const [maj, min, patch] = version.split('.');
    // version must be later than 0.51.2
    if (Number(maj) < 0 || Number(min) < 51 || Number(patch) < 2) {
      throw new Error('minimum required devcontainer-cli version is 0.51.2');
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
