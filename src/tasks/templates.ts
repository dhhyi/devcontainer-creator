import { dirname } from 'path';

import { baseImageReference, isBaseImage } from '../constants';
import { DevcontainerBuildFile, Language, VSCodeTask } from '../language';

import { DCCEnvKeys, VSCodeMetaType } from './devcontainer-meta';

export type AvailableTemplates =
  | '.vscode/tasks.json'
  | '.devcontainer/devcontainer.json'
  | '.devcontainer/Dockerfile';

function sortJson<T extends object>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  } else {
    return Object.entries(obj)
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .reduce((acc, [k, v]) => ({ ...acc, [k]: sortJson(v) }), {} as T);
  }
}

interface VSCodeTasksType {
  version: '2.0.0';
  tasks: (VSCodeTask & {
    type: 'shell';
    problemMatcher: never[];
  })[];
  inputs?: unknown;
}

const VSCodeTasksTemplate = (desc: Language): VSCodeTasksType | undefined => {
  const task = (label: string, command: string) => ({
    command,
    label,
    problemMatcher: [],
    type: 'shell' as const,
  });

  const tasks = [];

  if (desc.language?.binary) {
    let command = 'cont ${fileDirname} ' + desc.language.binary;
    if (desc.language.binaryArgs) {
      command += ` ${desc.language.binaryArgs}`;
    }
    command += ' ${file}';

    tasks.push(task('Run file continuously', command));

    tasks.push(
      task(
        'Run file continuously with arguments',
        command + ' ${input:arguments}'
      )
    );
  }

  if (desc.language?.repl) {
    tasks.push(task('Start REPL', desc.language.repl));
  }

  if (desc.vscode?.tasks?.length) {
    tasks.push(...desc.vscode.tasks.map((t) => task(t.label, t.command)));
  }

  if (tasks.length) {
    const json: VSCodeTasksType = {
      version: '2.0.0',
      tasks: tasks,
    };

    if (desc.language?.binary) {
      json.inputs = [
        {
          type: 'promptString',
          id: 'arguments',
          description: 'Arguments.',
          default: '1 2 3 4 5',
        },
      ];
    }

    return json;
  }
};

interface DevcontainerJSONType {
  name?: string;
  image?: string;
  build?: {
    dockerfile: 'Dockerfile';
    args?: Record<string, unknown>;
  };
  customizations?: {
    vscode: VSCodeMetaType;
  };
  runArgs?: string[];
  containerEnv?: Partial<Record<DCCEnvKeys, string>>;
}

const DevcontainerJSONTemplate = (
  desc: Language
): DevcontainerJSONType | undefined => {
  const json: DevcontainerJSONType = {};

  if (desc.devcontainer?.name) {
    json.name = desc.devcontainer.name;
  }

  if (desc.extras?.includes('forward-x11')) {
    if (!json.runArgs) {
      json.runArgs = [];
    }
    json.runArgs.push(
      '--net',
      'host',
      '-e',
      'DISPLAY=:0',
      '-v',
      '/tmp/.X11-unix:/tmp/.X11-unix'
    );
  }

  if (desc.devcontainer?.build) {
    json.build = {
      dockerfile: 'Dockerfile',
    };

    if (desc.devcontainer.build.args) {
      json.build.args = desc.devcontainer.build.args;
    }
  } else {
    json.image = baseImageReference(desc.extends);
  }

  const vscode: VSCodeMetaType = {};
  let settings: VSCodeMetaType['settings'] = {};
  if (desc.vscode?.settings) {
    settings = desc.vscode.settings;
  }
  if (desc.vscode && Array.isArray(desc.vscode.hideFiles)) {
    settings['files.exclude'] = desc.vscode.hideFiles.reduce(
      (acc, f) => ({ ...acc, [f]: true }),
      {}
    );
  }
  if (Object.keys(settings).length) {
    vscode.settings = sortJson(settings);
  }
  if (desc.vscode?.extensions?.length) {
    vscode.extensions = desc.vscode.extensions;
  }
  if (Object.keys(vscode).length) {
    json.customizations = { vscode };
  }

  const containerEnv: DevcontainerJSONType['containerEnv'] = desc.language
    ? {
        DCC_BINARY: '',
        DCC_REPL: '',
        DCC_VERSION: '',
      }
    : {};
  if (desc.language?.binary) {
    let command = desc.language.binary;
    if (desc.language.binaryArgs) {
      command += ` ${desc.language.binaryArgs}`;
    }
    containerEnv.DCC_BINARY = command;
  }
  if (desc.language?.repl) {
    containerEnv.DCC_REPL = desc.language.repl;
  }
  if (desc.language?.version !== false) {
    if (typeof desc.language?.version === 'string') {
      containerEnv.DCC_VERSION = desc.language.version
        .trim()
        .split('\n')
        .join('; ');
    } else if (desc.language?.binary) {
      containerEnv.DCC_VERSION = `${desc.language.binary} --version`;
    }
  }
  if (desc.devcontainer?.selftest) {
    containerEnv.DCC_SELFTEST = Buffer.from(
      desc.devcontainer.selftest
    ).toString('base64');
  }
  if (Object.keys(containerEnv).length) {
    json.containerEnv = sortJson(containerEnv);
  }

  return json;
};

const DockerfileTemplate = (desc: Language): string | undefined => {
  if (!desc.devcontainer?.build) {
    return;
  }

  const build = desc.devcontainer.build;

  const from = baseImageReference(desc.extends);

  const packages = build.packages || [];

  const remoteUser = desc.devcontainer?.remoteUser;

  const findInBuild = (build: string[] | undefined, key: string) => {
    return build?.some?.((line) => line.includes(key));
  };

  const [prepareBuildArgs, rootBuildArgs, userBuildArgs] = Object.keys(
    build.args || {}
  ).reduce(
    ([p, r, u], a) => {
      if (findInBuild(build.prepare, a)) {
        return [[...p, a], r, u];
      } else if (findInBuild(build.root, a)) {
        return [p, [...r, a], u];
      } else if (findInBuild(build.user, a)) {
        return [p, r, [...u, a]];
      } else {
        return [p, r, u];
      }
    },
    [[], [], []] as [string[], string[], string[]]
  );

  const fileTemplate = (file: DevcontainerBuildFile): string => {
    const encoded = Buffer.from(file.content).toString('base64');
    return `RUN mkdir -p "${dirname(
      file.path
    )}" && echo "${encoded}" | base64 -d > "${file.path}" && chmod ${
      file.type === 'script' ? '+rx' : '+r'
    } "${file.path}"`;
  };

  const [rootFiles, userFiles] = (build.files || []).reduce(
    ([r, u], f) => {
      const t = fileTemplate(f);
      if (f.path.includes('HOME') || f.path.includes(`/home/${remoteUser}`)) {
        return [r, [...u, t]];
      } else {
        return [[...r, t], u];
      }
    },
    [[], []] as [string[], string[]]
  );

  const blocks: string[] = [];

  blocks.push(`FROM ${from}`);

  if (
    !isBaseImage(from) &&
    (prepareBuildArgs.length ||
      packages.length ||
      rootBuildArgs.length ||
      build.root?.length)
  ) {
    blocks.push('USER root');
  }

  const mergeArgs = (args: string[]): string => {
    return args.map((a) => `ARG ${a}`).join('\n');
  };

  if (prepareBuildArgs.length) {
    blocks.push(mergeArgs(prepareBuildArgs));
  }

  if (build.prepare?.length) {
    blocks.push(build.prepare.join('\n'));
  }

  if (packages.length) {
    blocks.push(
      `RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends ${packages.join(
        ' '
      )} && apt-get clean && rm -rf /var/lib/apt/lists/*`
    );
  }

  if (rootBuildArgs.length) {
    blocks.push(mergeArgs(rootBuildArgs));
  }

  if (build.root?.length) {
    blocks.push(build.root.join('\n'));
  }

  if (rootFiles.length) {
    blocks.push(...rootFiles);
  }

  let user = `USER ${remoteUser}`;
  if (userFiles.length || findInBuild(build.user, 'HOME')) {
    user += `\nENV HOME=/home/${remoteUser}`;
  }
  blocks.push(user);

  if (userBuildArgs.length) {
    blocks.push(mergeArgs(userBuildArgs));
  }

  if (build.user?.length) {
    blocks.push(build.user.join('\n'));
  }

  if (userFiles.length) {
    blocks.push(...userFiles);
  }

  return blocks.join('\n\n') + '\n';
};

const JSONTemplate = (obj: object | undefined): string | undefined => {
  if (obj) {
    return JSON.stringify(obj, null, 2) + '\n';
  }
};

export const Template = (
  file: AvailableTemplates
): ((desc: Language) => string | undefined) => {
  switch (file) {
    case '.vscode/tasks.json':
      return (desc) => JSONTemplate(VSCodeTasksTemplate(desc));
    case '.devcontainer/devcontainer.json':
      return (desc) => JSONTemplate(DevcontainerJSONTemplate(desc));
    case '.devcontainer/Dockerfile':
      return (desc) => DockerfileTemplate(desc);
  }
};