import { execSync, spawnSync } from 'child_process';

import { memoize } from 'lodash-es';

import { logError, logStatus, logWarn } from '../logging';

import { VERBOSE } from './parse-args';

export const PulledImage: (image: string, fail?: boolean) => string = memoize(
  (image: string, fail = false) => {
    if (!image.includes(':')) {
      return PulledImage(`${image}:latest`, fail);
    } else {
      if (!execSync(`docker image ls -q ${image}`).toString().trim()) {
        logStatus('pulling', image);
        const pullBase = spawnSync('docker', ['pull', image]);

        if (pullBase.status !== 0) {
          if (fail) {
            logError(pullBase.stderr.toString());
            process.exit(1);
          } else {
            logWarn('failed to pull', image);
          }
        }
        if (VERBOSE) {
          logStatus(pullBase.stdout.toString());
        }
      }
      return image;
    }
  },
  (image, fail) => `${image}:${fail}`
);
