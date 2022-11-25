import {
  chmodSync,
  existsSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join, relative } from 'path';

import { once } from 'lodash-es';

import { DCC_PROTOCOL } from '../constants';
import { execute } from '../exec';
import { logPersist, logStatus } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';
import { GomplateBin } from './install-tools';
import { ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';
import { ExtractedResources } from './templates';

function writeUpdateScript() {
  const { languageYaml, targetDir, fullDevcontainer, devcontainerName } =
    ParsedArgs();

  logStatus('writing update script');

  let relativeYamlPath;
  if (languageYaml.startsWith(DCC_PROTOCOL)) {
    relativeYamlPath = languageYaml;
  } else {
    relativeYamlPath = relative(targetDir, languageYaml);
  }

  const updateArgs = [relativeYamlPath, '.'];
  if (fullDevcontainer) {
    updateArgs.push('--full');
  }
  if (devcontainerName) {
    updateArgs.push('--name', devcontainerName);
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

export const WriteDevcontainer = once(async () => {
  const TMP_DIR = TmpWorkingDir();
  const { targetDir, simpleImage } = ParsedArgs();
  const templates = await ExtractedResources();
  const resolvedYaml = await ResolvedYaml();

  logStatus('creating backups');
  templates.forEach((template) => {
    const templatePath = join(targetDir, template);
    if (existsSync(templatePath)) {
      renameSync(templatePath, templatePath + '~');
    }
  });

  const gomplateArgs = [
    '--input-dir',
    TMP_DIR,
    '--include',
    '"**/*.gomplate"',
    `--output-map=${targetDir}/{{ .in | strings.TrimSuffix ".gomplate" }}`,
    '-d',
    `language=${resolvedYaml.path}`,
  ];

  execute('writing devcontainer', GomplateBin, gomplateArgs, {
    env: {
      GOMPLATE_SUPPRESS_EMPTY: 'true',
      SIMPLE_IMAGE: simpleImage,
    },
  });

  logStatus('removing backups');
  templates.forEach((template) => {
    const templatePath = join(targetDir, template + '~');
    if (existsSync(templatePath)) {
      unlinkSync(templatePath);
    }
  });

  if (resolvedYaml.content?.devcontainer?.build?.files) {
    const files = resolvedYaml.content.devcontainer.build.files;
    Object.entries(files).forEach(([file, content]) => {
      if (content) {
        const filePath = join(targetDir, '.devcontainer', file);
        writeFileSync(filePath, content as string);
      }
    });
    const gitignorePath = join(targetDir, '.devcontainer', '.gitignore');
    writeFileSync(
      gitignorePath,
      ['.gitignore', ...Object.keys(files)].join('\n') + '\n'
    );
  }

  writeUpdateScript();

  logPersist('wrote devcontainer to', targetDir);

  return targetDir;
});
