import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { memoize, once } from 'lodash-es';

import { baseImageReference } from '../constants';

import { PulledImage } from './docker-pull';
import { ResolvedYaml } from './language-spec';
import { ParsedArgs } from './parse-args';
import { WriteDevcontainer } from './write-devcontainer';
interface DevcontainerMetaType {
  id?: string;
  remoteUser?: string;
  customizations?: {
    vscode?: {
      extensions?: string[];
      settings?: Record<string, unknown>;
    };
  };
}

export const DevcontainerMeta: (image: string) => DevcontainerMetaType[] =
  memoize((image) => {
    return JSON.parse(
      execSync(
        `docker inspect ${PulledImage(
          image,
          true
        )} --format='{{index .Config.Labels "devcontainer.metadata"}}'`,
        { encoding: 'utf8' }
      )
    );
  });

export const ConstructedDevcontainerMeta: () => Promise<
  DevcontainerMetaType[]
> = once(async () => {
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

  const resolvedYaml = (await ResolvedYaml()).content;
  const baseImage = baseImageReference(resolvedYaml?.devcontainer?.build?.base);
  const oldMeta = DevcontainerMeta(baseImage);

  return [...oldMeta, meta];
});

export const DumpDevcontainerMeta = once(async () => {
  const { simpleImage, targetDir } = ParsedArgs();

  let meta;
  if (simpleImage) {
    meta = DevcontainerMeta(simpleImage);
  } else {
    meta = await ConstructedDevcontainerMeta();
  }
  const metaFile = join(targetDir, '.devcontainer_meta.json');
  writeFileSync(metaFile, JSON.stringify(meta, null, 2));
});
