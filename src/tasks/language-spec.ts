import { spawnSync } from 'child_process';
import {
  appendFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import * as https from 'https';
import { join } from 'path';

import * as yaml from 'js-yaml';
import { once } from 'lodash-es';

import { baseImageReference, DCC_PROTOCOL, DCC_REFERENCE } from '../constants';
import { Language } from '../language';
import { logError, logPersist, logStatus, logWarn } from '../logging';

import { TmpWorkingDir } from './create-tmp-dir';
import { DevcontainerMeta } from './devcontainer-meta';
import { AjvCLIBin } from './install-tools';
import { ParsedArgs, VERBOSE } from './parse-args';
import { ExtractedResources } from './templates';

async function getYaml(languageYaml: string): Promise<Language> {
  const dir = TmpWorkingDir();

  if (languageYaml.startsWith(DCC_PROTOCOL)) {
    languageYaml = DCC_REFERENCE + languageYaml.substring(6);
    if (!languageYaml.endsWith('.yaml')) {
      languageYaml += '.yaml';
    }
  }

  if (languageYaml.startsWith('http')) {
    const downloadedYaml = join(dir, 'language.yaml');
    if (existsSync(downloadedYaml)) {
      unlinkSync(downloadedYaml);
    }

    const downloadFile = async (url: string, fileFullPath: string) => {
      logStatus(
        'downloading',
        url.includes(DCC_REFERENCE)
          ? url.replace(DCC_REFERENCE, DCC_PROTOCOL).replace(/\.ya?ml$/, '')
          : url
      );

      return new Promise((resolve, reject) => {
        https
          .get(url, (resp) => {
            // chunk received from the server
            resp.on('data', (chunk) => {
              appendFileSync(fileFullPath, chunk);
            });

            // last chunk received, we are done
            resp.on('end', () => {
              if (resp.statusCode === 200) {
                resolve('File downloaded and stored at: ' + fileFullPath);
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
      await downloadFile(languageYaml, downloadedYaml);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    languageYaml = downloadedYaml;
  }

  return yaml.load(readFileSync(languageYaml, 'utf8')) as Language;
}

function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeDeep(target: any, source: any): any {
  if (target === undefined && source === undefined) {
    return;
  }
  let output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output = { ...output, [key]: source[key] };
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        output = {
          ...output,
          [key]: [...(target[key] || []), ...source[key]],
        };
      } else {
        output = { ...output, [key]: source[key] };
      }
    });
  } else if (target === undefined) {
    return mergeDeep({}, source);
  }
  return output;
}

function mergeYaml(base: Language, ext: Language): Language {
  const newYaml = mergeDeep(base, ext);
  if (ext.language) {
    newYaml.language = ext.language;
  }
  return newYaml;
}

export const ResolvedYaml = once(async () => {
  const TMP_DIR = TmpWorkingDir();
  const { devcontainerName, languageYaml, simpleImage } = ParsedArgs();

  let resolvedYaml = await getYaml(languageYaml);
  while (resolvedYaml?.extends) {
    const extendingYaml = await getYaml(resolvedYaml.extends);
    delete resolvedYaml.extends;
    resolvedYaml = mergeYaml(extendingYaml, resolvedYaml);
  }

  if (devcontainerName) {
    if (!resolvedYaml.devcontainer) {
      resolvedYaml.devcontainer = {};
    }
    resolvedYaml.devcontainer.name = devcontainerName;
  }

  if (!resolvedYaml) {
    resolvedYaml = {};
  }
  if (!resolvedYaml.language) {
    resolvedYaml.language = {};
  }
  if (!resolvedYaml.devcontainer) {
    resolvedYaml.devcontainer = {};
  }
  if (!resolvedYaml.devcontainer.build) {
    resolvedYaml.devcontainer.build = {};
  }
  if (!resolvedYaml.devcontainer.build.base) {
    resolvedYaml.devcontainer.build.base = 'debian';
  }
  if (!resolvedYaml.vscode) {
    resolvedYaml.vscode = {};
  }
  if (!simpleImage && !resolvedYaml.vscode.hideFiles) {
    resolvedYaml.vscode.hideFiles = [
      '.devcontainer',
      '.vscode',
      '.update_devcontainer.sh',
    ];
  }
  if (!resolvedYaml.extras) {
    resolvedYaml.extras = [];
  }
  resolvedYaml.extras = resolvedYaml.extras.filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const baseImage = baseImageReference(resolvedYaml.devcontainer.build.base);

  const baseDevcontainerMeta = DevcontainerMeta(baseImage);
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

  if (VERBOSE) {
    logPersist('Resolved YAML:');
    logPersist(yaml.dump(resolvedYaml));
  }

  logStatus('validating yaml');
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
  if (VERBOSE) {
    logPersist('executing', AjvCLIBin(), ...ajvArgs);
  }
  const validation = spawnSync(AjvCLIBin(), ajvArgs);

  if (validation.status !== 0) {
    logError(validation.stderr.toString());
    process.exit(1);
  }

  if (VERBOSE) {
    logPersist(validation.stdout.toString());
  }

  return {
    path: yamlPath,
    content: resolvedYaml,
  };
});
