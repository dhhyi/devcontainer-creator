import { spawnSync } from 'child_process';

import { once } from 'lodash-es';

import { logPersist } from '../logging';

import { BuildDevcontainer } from './build-devcontainer';
import { MergedDevcontainerMeta } from './devcontainer-meta';
import { VERBOSE } from './parse-args';

export const RunDevcontainer = once(async () => {
  const image = await BuildDevcontainer();

  const environment = (await MergedDevcontainerMeta())?.containerEnv || {};

  const args = [
    'run',
    '-it',
    '--rm',
    ...Object.entries(environment).flatMap(([key, value]) => [
      '-e',
      `${key}=${value}`,
    ]),
    image,
    'sh',
    '-c',
    [
      'sudo -E /home/dcc/install-helpers.sh',
      'sh -e /disclaimer.sh',
      'cd $HOME',
      'fish',
    ].join(' && '),
  ];

  if (VERBOSE) {
    logPersist('executing', 'docker', ...args);
  }

  spawnSync('docker', args, { stdio: 'inherit' });
});
