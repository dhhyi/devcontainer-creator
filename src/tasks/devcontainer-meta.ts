import { execSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { once } from 'lodash-es';

import { execute } from '../exec';

import { BuildDevcontainer } from './build-devcontainer';
import { PulledImage } from './docker-pull';
import { DevcontainerCLIBin } from './install-tools';
import { ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';
import { WriteDevcontainer } from './write-devcontainer';

interface VSCodeMetaType {
  extensions?: string[];
  settings?: Record<string, unknown>;
}

interface DCCMetaType {
  tasks?: {
    label: string;
    command: string;
  }[];
  script?: string | boolean;
  languageName?: string;
}

interface DevcontainerMetaType {
  id?: string;
  remoteUser?: string;
  customizations?: {
    vscode?: VSCodeMetaType;
    dcc?: DCCMetaType;
  };
}

interface MergedDevcontainerMetaType {
  customizations?: {
    vscode?: VSCodeMetaType[];
    dcc?: DCCMetaType[];
  };
  containerEnv?: Record<string, string>;
}

export function getDevcontainerMeta(image: string): DevcontainerMetaType[] {
  return JSON.parse(
    execSync(
      `docker inspect ${PulledImage(
        image,
        true
      )} --format='{{index .Config.Labels "devcontainer.metadata"}}'`,
      { encoding: 'utf8' }
    )
  );
}

export const MergedDevcontainerMeta = once(
  async (): Promise<MergedDevcontainerMetaType> => {
    const targetDir = ParsedArgs().targetDir;
    return JSON.parse(
      execute(
        undefined,
        DevcontainerCLIBin,
        [
          'read-configuration',
          '--workspace-folder',
          targetDir,
          '--include-merged-configuration',
        ],
        { response: 'stdout' }
      )
    ).mergedConfiguration;
  }
);

export const ConstructedDevcontainerMeta: () => Promise<DevcontainerMetaType> =
  once(async () => {
    const meta = JSON.parse(
      readFileSync(
        join(await WriteDevcontainer(), '.devcontainer', 'devcontainer.json'),
        {
          encoding: 'utf8',
        }
      )
    );
    if (meta.build) {
      delete meta.build;
    }
    if (meta.name) {
      delete meta.name;
    }
    if (meta.settings || meta.extensions) {
      meta.customizations = {
        vscode: {},
      };
      if (meta.settings) {
        meta.customizations.vscode.settings = meta.settings;
        delete meta.settings;
      }
      if (meta.extensions) {
        meta.customizations.vscode.extensions = meta.extensions;
        delete meta.extensions;
      }
    }
    return meta;
  });

export const ConstructedDCCMeta: () => Promise<
  DevcontainerMetaType | undefined
> = once(async () => {
  const yaml = await ResolvedYaml();

  const dcc: Record<string, unknown> = {};
  if (typeof yaml.vscode?.script === 'string') {
    dcc.script = Buffer.from(yaml.vscode.script).toString('base64');
  } else if (typeof yaml.vscode?.script === 'boolean') {
    dcc.script = '';
  }
  if (yaml.vscode?.tasks) {
    dcc.tasks = yaml.vscode.tasks;
  }
  if (yaml.language?.name) {
    dcc.languageName = yaml.language.name;
  }
  if (Object.keys(dcc).length > 0) {
    return {
      customizations: {
        dcc,
      },
    };
  }
});

export function appendMetaToImage(image: string, meta: DevcontainerMetaType) {
  const oldMeta = getDevcontainerMeta(image);
  const newMeta = JSON.stringify([...oldMeta, meta]);

  const append = spawnSync(
    'docker',
    ['build', '-t', image, '--label', `devcontainer.metadata=${newMeta}`, '-'],
    {
      input: `FROM ${image}`,
    }
  );

  if (append.status !== 0) {
    throw new Error(`Failed to append metadata to image ${image}`);
  }
}

export const DumpDevcontainerMeta = once(async () => {
  const { targetDir } = ParsedArgs();
  const image = await BuildDevcontainer();
  const meta = getDevcontainerMeta(image);

  const metaFile = join(targetDir, '.devcontainer_meta.json');
  writeFileSync(metaFile, JSON.stringify(meta, null, 2));
});
