import { readFileSync } from 'fs';
import * as https from 'https';

import * as yaml from 'js-yaml';
import { once } from 'lodash-es';

import { baseImageReference, DCC_PROTOCOL } from '../constants';
import { Language } from '../language';
import { logError, logPersist, logStatus, logWarn } from '../logging';

import {
  getDevcontainerMeta,
  MergedDevcontainerMeta,
} from './devcontainer-meta';
import { ParsedArgs, VERY_VERBOSE } from './parse-args';

async function getYaml(languageYaml: string): Promise<Language> {
  if (languageYaml.startsWith(DCC_PROTOCOL)) {
    return { extends: languageYaml as Language['extends'] };
  }

  if (languageYaml.startsWith('http')) {
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
  const { devcontainerName, languageYaml, vscode, validate } = ParsedArgs();

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

  if (VERY_VERBOSE) {
    logPersist('Resolved YAML:');
    logPersist(yaml.dump(resolvedYaml));
  }

  logStatus('validating language spec');

  if (validate) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const validateAjv = require('../validate_language.js');

    try {
      if (!validateAjv(resolvedYaml)) {
        throw new Error(
          'invalid yaml: ' + JSON.stringify(validateAjv.errors, undefined, 2)
        );
      }
      if (resolvedYaml.extras?.includes?.('traefik') && !resolvedYaml.traefik) {
        throw new Error(
          'invalid yaml: traefik root config must be defined if extras contains traefik'
        );
      }
    } catch (error) {
      logError((error as Error).message);
      process.exit(1);
    }
  }

  return resolvedYaml;
});

export const ExpandedYaml = once(async () => {
  const merged = await MergedDevcontainerMeta();

  const resolvedYaml = await ResolvedYaml();

  if (!Object.keys(resolvedYaml?.language || {}).length) {
    const language: Language['language'] = {};
    if (merged?.containerEnv?.DCC_REPL) {
      language.repl = merged.containerEnv.DCC_REPL;
    }
    if (merged?.containerEnv?.DCC_BINARY) {
      const split = merged.containerEnv.DCC_BINARY.split(' ');
      const binary = split[0];
      language.binary = binary;
      if (split.length > 1) {
        language.binaryArgs = split.slice(1).join(' ');
      }
    }
    if (merged?.containerEnv?.DCC_VERSION) {
      language.version = merged.containerEnv.DCC_VERSION;
    }
    if (Object.keys(language).length) {
      resolvedYaml.language = language;
    }
  }
  const custom = [
    ...(merged.customizations?.dcc || []),
    {
      tasks: resolvedYaml.vscode?.tasks,
      languageName: resolvedYaml.language?.name,
    },
  ].reduce((acc, val) => ({
    tasks: [...(acc.tasks || []), ...(val.tasks || [])].filter(
      (v, i, a) => a.findIndex((t) => t.label === v.label) === i
    ),
    languageName: val.languageName || acc.languageName,
  }));

  if (custom?.tasks) {
    if (!resolvedYaml.vscode) {
      resolvedYaml.vscode = {};
    }
    resolvedYaml.vscode.tasks = custom.tasks;
  }
  if (custom?.languageName) {
    if (!resolvedYaml.language) {
      resolvedYaml.language = {};
    }
    resolvedYaml.language.name = custom.languageName;
  }

  return resolvedYaml;
});
