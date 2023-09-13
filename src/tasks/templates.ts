import { dirname } from 'path';

import { DCC_PROTOCOL, baseImageReference, isBaseImage } from '../constants';
import { DevcontainerBuildFile, Language, VSCodeTask } from '../language';

import { DCCEnvKeys, VSCodeMetaType } from './devcontainer-meta';

function parseCommand(input: string): string {
  return input
    .split('\n')
    .filter((l) => l.trim())
    .filter((l) => !l.startsWith('#'))
    .join(' && ')
    .replaceAll(/&&\s+&&/g, '&&');
}

function addCommand(previous: string | undefined, next: string): string {
  if (!previous?.trim()) return next;
  return `${previous} && ${next}`;
}

export type AvailableTemplates =
  | '.vscode/tasks.json'
  | '.devcontainer/devcontainer.json'
  | '.devcontainer/Dockerfile';

function sortJson<T extends object>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(sortJson) as T;
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
    cacheFrom?: string;
    args?: Record<string, string | number>;
  };
  mounts?: string[];
  postStartCommand?: string;
  customizations?: {
    vscode: VSCodeMetaType;
  };
  runArgs?: string[];
  forwardPorts?: number[];
  containerEnv?: Partial<Record<DCCEnvKeys, string>>;
}

function needsDockerfile(desc: Language): boolean {
  return !!(
    desc.devcontainer?.build ||
    desc.devcontainer?.ports ||
    desc?.devcontainer?.publish?.labels
  );
}

function flattenObject(obj: object): [string, string][] {
  const result: [string, string][] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) {
      for (const [kk, vv] of flattenObject(v)) {
        result.push([`${k}.${kk}`, vv]);
      }
    } else {
      result.push([k, String(v)]);
    }
  }
  return result;
}

const DevcontainerJSONTemplate = (
  desc: Language
): DevcontainerJSONType | undefined => {
  const remoteUser = desc.devcontainer?.remoteUser;

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

  if (desc.extras?.includes('traefik') && desc.traefik) {
    if (!json.runArgs) {
      json.runArgs = [];
    }
    if (desc.traefik.labels) {
      json.runArgs.push('--label', 'traefik.enable=true');
      for (const [k, v] of flattenObject(desc.traefik.labels)) {
        const key = k.startsWith('traefik.') ? k : `traefik.${k}`;
        json.runArgs.push('--label', `${key}=${v}`);
      }
    }
    json.runArgs.push('--network', desc.traefik.network);
  }

  if (desc.extras?.includes('tmpfs') && desc.tmpfs) {
    if (!json.runArgs) {
      json.runArgs = [];
    }
    for (const path of desc.tmpfs) {
      const mount = path.startsWith('/')
        ? path
        : `\${containerWorkspaceFolder}/${path}`;
      json.runArgs.push('--tmpfs', `${mount}:exec`);
    }
  }

  if (desc.extras?.includes('named-volumes') && desc.namedVolumes) {
    if (!json.mounts) {
      json.mounts = [];
    }
    const mounts = Object.entries(desc.namedVolumes).map(([k, v]) => {
      const options = ['type=volume'];
      if (k.startsWith('/') || k.startsWith('$')) {
        options.push(
          `target=${k.replace(/\$\{?HOME\}?/, '/home/' + remoteUser)}`
        );
      } else {
        options.push('target=${containerWorkspaceFolder}/' + k);
      }
      if (v) {
        options.push(`source=${v}`);
      }
      return options.join(',');
    });
    json.mounts.push(...mounts);

    const command =
      'sudo chown $USER ' +
      Object.keys(desc.namedVolumes)
        .map((k) => k.replace(/\$\{?HOME\}?/, '/home/' + remoteUser))
        .join(' ');
    json.postStartCommand = addCommand(json.postStartCommand, command);
  }

  if (needsDockerfile(desc)) {
    json.build = {
      dockerfile: 'Dockerfile',
    };

    if (desc.devcontainer?.publish?.image) {
      const image = desc.devcontainer.publish.image;
      if (image.startsWith(DCC_PROTOCOL)) {
        json.build.cacheFrom = baseImageReference(image);
      } else {
        json.build.cacheFrom = image;
      }
    }

    if (desc.devcontainer?.build?.args) {
      json.build.args = desc.devcontainer.build.args;
    }
  } else {
    json.image = baseImageReference(desc.extends);
  }

  if (desc.devcontainer?.initialize) {
    json.postStartCommand = addCommand(
      json.postStartCommand,
      parseCommand(desc.devcontainer.initialize)
    );
  }

  if (desc.devcontainer?.ports) {
    json.forwardPorts = desc.devcontainer.ports;
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
  if (desc.devcontainer?.environment) {
    for (const [k, v] of Object.entries(desc.devcontainer.environment)) {
      containerEnv[k] = v;
    }
  }
  if (Object.keys(containerEnv).length) {
    json.containerEnv = sortJson(containerEnv);
  }

  return json;
};

const DockerfileTemplate = (desc: Language): string | undefined => {
  if (!needsDockerfile(desc)) {
    return;
  }

  const blocks: string[] = [];

  const from = baseImageReference(desc.extends);

  blocks.push(`FROM ${from}`);

  if (desc.devcontainer?.build) {
    const build = desc.devcontainer.build;

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

    if (
      !isBaseImage(from) &&
      (prepareBuildArgs.length ||
        packages.length ||
        rootBuildArgs.length ||
        build.root?.length ||
        rootFiles.length)
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
  }

  if (desc.devcontainer?.ports) {
    blocks.push(`EXPOSE ${desc.devcontainer.ports.join(' ')}`);
  }

  if (desc.devcontainer?.publish?.labels) {
    const labels = Object.entries(desc.devcontainer.publish.labels)
      .map(([k, v]) => `"${k}"="${v}"`)
      .join(' ');
    blocks.push(`LABEL ${labels}`);
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
