import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { once } from 'lodash-es';

import { logStatus } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';

export const ExtractedResources = once(async () => {
  const dir = TmpWorkingDir();

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  const resources = {
    '.devcontainer/cont.sh.gomplate': undefined,
    '.devcontainer/devcontainer.json.gomplate': import(
      // @ts-ignore
      '../../templates/.devcontainer/devcontainer.json.gomplate'
    ),
    '.devcontainer/disclaimer.sh.gomplate': undefined,
    '.devcontainer/Dockerfile.gomplate': import(
      // @ts-ignore
      '../../templates/.devcontainer/Dockerfile.gomplate'
    ),
    '.devcontainer/selftest.sh.gomplate': undefined,
    '.vscode/tasks.json.gomplate': import(
      // @ts-ignore
      '../../templates/.vscode/tasks.json.gomplate'
    ),
    '.vscode/vscode.code-snippets.gomplate': import(
      // @ts-ignore
      '../../templates/.vscode/vscode.code-snippets.gomplate'
    ),
    'language_schema.json': import(
      // @ts-ignore
      '../../templates/language_schema.json'
    ),
  };
  /* eslint-enable @typescript-eslint/ban-ts-comment */

  logStatus('writing templates to', dir);

  await Promise.all(
    Object.entries(resources)
      .filter(([, c]) => !!c)
      .map(([filename, content]) => {
        const file = join(dir, filename);
        if (!existsSync(dirname(file))) {
          mkdirSync(dirname(file), { recursive: true });
        }
        if (content) {
          return content.then((c) => {
            writeFileSync(file, c.default);
          });
        }
      })
  );

  return Object.keys(resources)
    .filter((f) => f.endsWith('.gomplate'))
    .map((f) => f.replace('.gomplate', ''));
});
