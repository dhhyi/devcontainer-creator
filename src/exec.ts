import { spawnSync } from 'child_process';

import { logError, logPersist, logStatus } from './logging';
import { VERBOSE, VERY_VERBOSE } from './tasks/parse-args';

export function execute(
  message: string | undefined,
  binary: (() => string) | string,
  args: string[]
): void;

export function execute(
  message: string | undefined,
  binary: (() => string) | string,
  args: string[],
  options: { response?: 'stdout'; env?: Record<string, string> }
): string;

export function execute(
  message: string | undefined,
  binary: (() => string) | string,
  args: string[],
  options?: {
    response?: 'stdout' | 'none';
    env?: Record<string, string>;
  }
) {
  const binaryResolved = typeof binary === 'string' ? binary : binary();

  if (VERY_VERBOSE) {
    logPersist('executing', binaryResolved, ...args);
  } else if (message) {
    logStatus(message);
  }

  const build = spawnSync(binaryResolved, args, {
    stdio: [
      'pipe',
      options?.response === 'stdout' || !VERBOSE ? 'pipe' : 'inherit',
      VERBOSE ? 'inherit' : 'pipe',
    ],
    encoding: 'utf-8',
    env: { ...process.env, ...options?.env },
  });

  if (build.status !== 0) {
    logError(build.stderr || build.error);
    throw new Error();
  }

  if (options?.response === 'stdout') {
    return build.stdout;
  }
}
