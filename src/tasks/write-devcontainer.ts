import {
  chmodSync,
  existsSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { basename, join, relative } from 'path';

import * as yaml from 'js-yaml';
import { once } from 'lodash-es';

import { baseImageReference, DCC_PROTOCOL } from '../constants';
import { execute } from '../exec';
import { Language } from '../language';
import { logPersist, logStatus } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';
import { GomplateBin } from './install-tools';
import { ExpandedYaml, ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';
import { ExtractedResources } from './templates';

function writeUpdateScript() {
  const { languageYaml, targetDir, devcontainerName } = ParsedArgs();

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

async function executeGomplate(
  folder: '.devcontainer' | '.vscode',
  resolvedYamlPath: string,
  resolvedYamlContent: Language
) {
  const workingDir = join(TmpWorkingDir(), folder);
  const targetDir = join(ParsedArgs().targetDir, folder);
  const templates = (await ExtractedResources())
    .filter((t) => t.startsWith(folder))
    .map((f) => basename(f));

  logStatus('creating backups');
  templates.forEach((template) => {
    const templatePath = join(targetDir, template);
    if (existsSync(templatePath)) {
      renameSync(templatePath, templatePath + '~');
    }
  });

  const gomplateArgs = [
    '--input-dir',
    workingDir,
    '--include',
    '"**/*.gomplate"',
    `--output-map=${targetDir}/{{ .in | strings.TrimSuffix ".gomplate" }}`,
    '-d',
    `language=${resolvedYamlPath}`,
  ];

  const gomplateEnv: Record<string, string> = {
    GOMPLATE_SUPPRESS_EMPTY: 'true',
    BASE_IMAGE: baseImageReference(resolvedYamlContent.extends),
  };
  execute('writing ' + folder, GomplateBin, gomplateArgs, {
    env: gomplateEnv,
  });

  logStatus('removing backups');
  templates.forEach((template) => {
    const templatePath = join(targetDir, template + '~');
    if (existsSync(templatePath)) {
      unlinkSync(templatePath);
    }
  });
}

export const WriteDevcontainer = once(async () => {
  const resolvedYaml = await ResolvedYaml();
  const targetDir = ParsedArgs().targetDir;

  await executeGomplate(
    '.devcontainer',
    resolvedYaml.path,
    resolvedYaml.content
  );

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

  const expandedYaml = await ExpandedYaml();
  const expandedYamlPath = resolvedYaml.path.replace('.yaml', '.expanded.yaml');
  writeFileSync(expandedYamlPath, yaml.dump(expandedYaml), {
    encoding: 'utf8',
  });

  await executeGomplate('.vscode', expandedYamlPath, expandedYaml);

  writeUpdateScript();

  logPersist('wrote devcontainer to', targetDir);

  return targetDir;
});
