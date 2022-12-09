import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import * as https from 'https';
import { join } from 'path';

import * as yaml from 'js-yaml';
import { once } from 'lodash-es';

import { baseImageReference, DCC_PROTOCOL } from '../constants';
import { execute } from '../exec';
import { Language } from '../language';
import { logError, logPersist, logStatus, logWarn } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';
import {
  getDevcontainerMeta,
  MergedDevcontainerMeta,
} from './devcontainer-meta';
import { AjvCLIBin } from './install-tools';
import { ParsedArgs, VERY_VERBOSE } from './parse-args';
import { ExtractedResources } from './templates';

async function getYaml(languageYaml: string): Promise<Language> {
  const dir = TmpWorkingDir();

  if (languageYaml.startsWith(DCC_PROTOCOL)) {
    return { extends: languageYaml as Language['extends'] };
  }

  if (languageYaml.startsWith('http')) {
    const downloadedYaml = join(dir, 'language.yaml');
    if (existsSync(downloadedYaml)) {
      unlinkSync(downloadedYaml);
    }

    const downloadFile = async (url: string): Promise<string> => {
      logStatus('downloading', url);

      return new Promise((resolve, reject) => {
        let rawData = '';

        https
          .get(url, (resp) => {
            // chunk received from the server
            resp.on('data', (chunk) => {
              rawData += chunk;
            });

            // last chunk received, we are done
            resp.on('end', () => {
              if (resp.statusCode === 200) {
                resolve(rawData);
              } else {
                reject(
                  new Error('Failed to download file: ' + resp.statusMessage)
                );
              }
            });
          })
          .on('error', (err) => {
            reject(new Error(err.message));
          });
      });
    };

    try {
      return yaml.load(await downloadFile(languageYaml)) as Language;
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  }

  return yaml.load(readFileSync(languageYaml, 'utf8')) as Language;
}

export const ResolvedYaml = once(async () => {
  const TMP_DIR = TmpWorkingDir();
  const { devcontainerName, languageYaml, vscode } = ParsedArgs();

  let resolvedYaml = await getYaml(languageYaml);

  if (devcontainerName) {
    if (!resolvedYaml.devcontainer) {
      resolvedYaml.devcontainer = {};
    }
    resolvedYaml.devcontainer.name = devcontainerName;
  }

  if (!resolvedYaml) {
    resolvedYaml = {};
  }
  if (!resolvedYaml.extends) {
    resolvedYaml.extends = 'base://debian';
  }
  if (!resolvedYaml.language) {
    resolvedYaml.language = {};
  }
  if (!resolvedYaml.devcontainer) {
    resolvedYaml.devcontainer = {};
  }
  if (!resolvedYaml.vscode) {
    resolvedYaml.vscode = {};
  }
  if (!resolvedYaml.vscode.hideFiles) {
    resolvedYaml.vscode.hideFiles = [
      '.devcontainer',
      '.update_devcontainer.sh',
    ];
    if (vscode) {
      resolvedYaml.vscode.hideFiles.push('.vscode');
    }
  }
  if (!resolvedYaml.extras) {
    resolvedYaml.extras = [];
  }
  resolvedYaml.extras = resolvedYaml.extras.filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const baseImage = baseImageReference(resolvedYaml.extends);

  const baseDevcontainerMeta = getDevcontainerMeta(baseImage);
  const remoteUser = baseDevcontainerMeta.reduce(
    (acc, cur) => cur.remoteUser || acc,
    ''
  );
  if (remoteUser === resolvedYaml.devcontainer.remoteUser) {
    logWarn(`declaration of 'remoteUser: ${remoteUser}' is redundant`);
  } else if (!resolvedYaml.devcontainer.remoteUser) {
    resolvedYaml.devcontainer.remoteUser = remoteUser;
  }

  const inheritedExtensions = baseDevcontainerMeta.reduce((acc, cur) => {
    if (cur.customizations?.vscode?.extensions) {
      return [...acc, ...cur.customizations.vscode.extensions];
    }
    return acc;
  }, [] as string[]);
  if (resolvedYaml.vscode?.extensions) {
    resolvedYaml.vscode.extensions.forEach((ext) => {
      if (inheritedExtensions.includes(ext)) {
        logWarn(`extension '${ext}' is already inherited`);
      }
    });
  }

  const yamlPath = join(TMP_DIR, 'language.yaml');

  writeFileSync(yamlPath, yaml.dump(resolvedYaml));

  if (VERY_VERBOSE) {
    logPersist('Resolved YAML:');
    logPersist(yaml.dump(resolvedYaml));
  }

  await ExtractedResources();

  const ajvArgs = [
    'validate',
    '-s',
    join(TMP_DIR, 'language_schema.json'),
    '-d',
    yamlPath,
    '--errors=text',
    '--verbose',
  ];

  execute('validating yaml', AjvCLIBin, ajvArgs);

  return resolvedYaml;
});

export const ExpandedYaml = once(async () => {
  const merged = await MergedDevcontainerMeta();

  const resolvedYaml = await ResolvedYaml();

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  if (!Object.keys(resolvedYaml?.language || {}).length) {
    if (merged?.containerEnv?.DCC_REPL) {
      resolvedYaml.language!.repl = merged.containerEnv.DCC_REPL;
    }
    if (merged?.containerEnv?.DCC_BINARY) {
      const split = merged.containerEnv.DCC_BINARY.split(' ');
      const binary = split[0];
      resolvedYaml.language!.binary = binary;
      if (split.length > 1) {
        resolvedYaml.language!.binaryArgs = split.slice(1).join(' ');
      }
    }
    if (merged?.containerEnv?.DCC_VERSION) {
      resolvedYaml.language!.version = merged.containerEnv.DCC_VERSION;
    }
  }
  const custom = [
    ...(merged.customizations?.dcc || []).map((e) => ({
      ...e,
      script:
        typeof e.script === 'string'
          ? Buffer.from(e.script, 'base64').toString('utf-8')
          : e.script,
    })),
    {
      tasks: resolvedYaml.vscode!.tasks,
      script: resolvedYaml.vscode!.script,
      languageName: resolvedYaml.language?.name,
    },
  ].reduce((acc, val) => ({
    script: val.script === undefined ? acc.script : val.script,
    tasks: [...(acc.tasks || []), ...(val.tasks || [])].filter(
      (v, i, a) => a.findIndex((t) => t.label === v.label) === i
    ),
    languageName: val.languageName || acc.languageName,
  }));

  if (custom?.script) {
    resolvedYaml.vscode!.script = custom.script;
  }
  if (custom?.tasks) {
    resolvedYaml.vscode!.tasks = custom.tasks;
  }
  if (custom?.languageName) {
    resolvedYaml.language!.name = custom.languageName;
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return resolvedYaml;
});
