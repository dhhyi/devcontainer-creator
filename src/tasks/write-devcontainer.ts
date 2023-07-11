import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, join, relative } from 'path';

import { once } from 'lodash-es';

import { DCC_PROTOCOL } from '../constants';
import { Language } from '../language';
import { logPersist, logStatus } from '../logging';

import { ExpandedYaml, ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';
import { AvailableTemplates, Template } from './templates';

function writeUpdateScript() {
  const { languageYaml, targetDir, devcontainerName, vscode, validate } =
    ParsedArgs();

  logStatus('writing update script');

  let relativeYamlPath;
  if (
    languageYaml.startsWith(DCC_PROTOCOL) ||
    languageYaml.startsWith('http')
  ) {
    relativeYamlPath = languageYaml;
  } else {
    relativeYamlPath = relative(targetDir, languageYaml);
  }

  const updateArgs = [relativeYamlPath, '.'];
  if (devcontainerName) {
    updateArgs.push('--name', devcontainerName);
  }
  if (!vscode) {
    updateArgs.push('--no-vscode');
  }
  if (!validate) {
    updateArgs.push('--no-validate');
  }
  updateArgs.push('"$@"');

  const updateArgsString = updateArgs
    .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
    .join(' ');

  const updateScriptPath = join(targetDir, '.update_devcontainer.sh');
  writeFileSync(
    updateScriptPath,
    `#!/bin/sh -e

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - ${updateArgsString}
`
  );
  chmodSync(updateScriptPath, '755');
}

function writeFile(file: AvailableTemplates, desc: Language) {
  const targetDir = join(ParsedArgs().targetDir, dirname(file));

  const newContent = Template(file)(desc);

  let update = false;

  const targetFile = join(targetDir, basename(file));

  if (newContent) {
    if (existsSync(targetFile)) {
      const oldContent = readFileSync(targetFile, 'utf8');

      if (oldContent === newContent) {
        logStatus(file, 'is up to date');
      } else {
        update = true;
      }
    } else {
      update = true;
    }

    if (update) {
      logStatus('writing ' + file);

      mkdirSync(targetDir, { recursive: true });

      writeFileSync(targetFile, newContent);
    }
  } else {
    if (existsSync(targetFile)) {
      unlinkSync(targetFile);
    }
  }
}

export const WriteDevcontainer = once(async () => {
  const resolvedYaml = await ResolvedYaml();
  const { targetDir, vscode } = ParsedArgs();

  writeFile('.devcontainer/devcontainer.json', resolvedYaml);
  writeFile('.devcontainer/Dockerfile', resolvedYaml);

  if (vscode) {
    const expandedYaml = await ExpandedYaml();
    writeFile('.vscode/tasks.json', expandedYaml);
  }

  writeUpdateScript();

  logPersist('wrote devcontainer to', targetDir);

  return targetDir;
});
