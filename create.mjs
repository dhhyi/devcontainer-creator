import * as yaml from "js-yaml";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as cp from "child_process";
import * as https from "https";
import Ajv from "ajv";

const DCC_REFERENCE =
  "https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/examples/";
const DCC_PROTOCOL = "dcc://";

const VERBOSE = process.argv.includes("--verbose");

function parseArgs() {
  function printUsageAndExit() {
    console.log("Usage: node create.js <language.yaml> <target-folder>");
    process.exit(1);
  }

  if (process.argv.length < 4) {
    printUsageAndExit();
  }

  const argv = process.argv.slice(2);

  const languageYaml = argv[0];
  let targetDir = argv[1];

  let extraArgs = argv.slice(2);
  if (targetDir === "--test") {
    extraArgs = argv.slice(1);
    targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "dcc-test-"));
  } else if (targetDir.startsWith("-")) {
    printUsageAndExit();
  }

  const fullDevcontainer = extraArgs.includes("--full");
  const devcontainerNameArg = extraArgs.findIndex((arg) => arg === "--name");
  const devcontainerName =
    devcontainerNameArg >= 0 && extraArgs[devcontainerNameArg + 1];
  const test = extraArgs.includes("--test");
  const tagArg = extraArgs.findIndex((arg) => arg === "--tag");
  const tag = tagArg >= 0 && extraArgs[tagArg + 1];
  const dumpMeta = extraArgs.includes("--dump-meta");
  const build = extraArgs.includes("--build") || test || tag || dumpMeta;
  const cacheFromArg = extraArgs.findIndex((arg) => arg === "--cache-from");
  const cacheFrom = cacheFromArg >= 0 && extraArgs[cacheFromArg + 1];
  const pinImage = extraArgs.includes("--pin-image");

  let simpleImage = "";
  if (languageYaml.startsWith(DCC_PROTOCOL) && !fullDevcontainer) {
    const lang = languageYaml.substring(DCC_PROTOCOL.length);
    simpleImage = `ghcr.io/dhhyi/dcc-devcontainer-${lang}:latest`;
  }

  return {
    languageYaml,
    targetDir,
    simpleImage,
    fullDevcontainer,
    devcontainerName,
    build,
    cacheFrom,
    test,
    tag,
    pinImage,
    dumpMeta,
  };
}

const ARGS = parseArgs();

function createTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devcontainer-creator-"));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
}

const TMP_DIR = createTmpDir();

const TMP_YAML_FILE = path.join(TMP_DIR, "language.yaml");

if (!process.stdout.clearLine) {
  console.time("dcc");
}

function logStatus(...message) {
  if (VERBOSE) {
    console.log(...message);
  } else if (process.stdout.clearLine) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(message.join(" "));
  } else {
    console.timeLog("dcc", ...message);
  }
}

function logPersist(...message) {
  if (VERBOSE) {
    console.log(...message);
  } else if (process.stdout.clearLine) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(...message);
  } else {
    console.timeLog("dcc", ...message);
  }
}

function logWarn(...message) {
  if (VERBOSE) {
    if (!process.stdout.clearLine) {
      console.log("::warning::", ...message);
    } else {
      console.warn(...message);
    }
  } else if (process.stdout.clearLine) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.warn(...message);
  } else {
    console.timeLog("dcc");
    console.log("::warning::", ...message);
  }
}

function logError(...message) {
  console.log("\n\x1b[31m", ...message, "\x1b[0m");
}

function installTools() {
  const tools = ["gomplate"];
  if (ARGS.build) {
    tools.push("@devcontainers/cli");
  }

  try {
    logStatus("installing tools");
    cp.execSync(
      `npm exec pnpm -- install --prefer-offline ${tools.join(" ")}`,
      {
        stdio: "ignore",
        cwd: TMP_DIR,
      }
    );
  } catch (error) {
    logError("error installing dependencies:", error.message);
    process.exit(1);
  }
}

async function extractResources() {
  const resources = {
    ".devcontainer/cont.sh.gomplate": undefined,
    ".devcontainer/devcontainer.json.gomplate": import(
      "./templates/.devcontainer/devcontainer.json.gomplate"
    ),
    ".devcontainer/disclaimer.sh.gomplate": undefined,
    ".devcontainer/Dockerfile.gomplate": import(
      "./templates/.devcontainer/Dockerfile.gomplate"
    ),
    ".devcontainer/selftest.sh.gomplate": undefined,
    ".vscode/tasks.json.gomplate": import(
      "./templates/.vscode/tasks.json.gomplate"
    ),
    ".vscode/vscode.code-snippets.gomplate": import(
      "./templates/.vscode/vscode.code-snippets.gomplate"
    ),
    "language_schema.json": import("./templates/language_schema.json"),
  };

  logStatus("writing templates to", TMP_DIR);

  await Promise.all(
    Object.entries(resources)
      .filter(([, c]) => !!c)
      .map(([filename, content]) => {
        const file = path.join(TMP_DIR, filename);
        if (!fs.existsSync(path.dirname(file))) {
          fs.mkdirSync(path.dirname(file), { recursive: true });
        }
        return content.then((c) => {
          fs.writeFileSync(file, c.default);
        });
      })
  );

  return Object.keys(resources)
    .filter((f) => f.endsWith(".gomplate"))
    .map((f) => f.replace(".gomplate", ""));
}

function pullImage(image, fail = false) {
  if (!cp.execSync(`docker image ls -q ${image}`).toString().trim()) {
    logStatus("pulling", image);
    const pullBase = cp.spawnSync("docker", ["pull", image]);

    if (pullBase.status !== 0) {
      if (fail) {
        logError(pullBase.stderr.toString());
        process.exit(1);
      } else {
        logWarn("failed to pull", image);
      }
    }
    if (VERBOSE) {
      logStatus(pullBase.stdout.toString());
    }
  }
}

function getDevcontainerMeta(image) {
  return JSON.parse(
    cp.execSync(
      `docker inspect ${image} --format='{{index .Config.Labels "devcontainer.metadata"}}'`,
      { encoding: "utf8" }
    )
  );
}

async function resolveAndValidateYaml() {
  async function getYaml(languageYaml) {
    if (languageYaml.startsWith(DCC_PROTOCOL)) {
      languageYaml = DCC_REFERENCE + languageYaml.substring(6);
      if (!languageYaml.endsWith(".yaml")) {
        languageYaml += ".yaml";
      }
    }

    if (languageYaml.startsWith("http")) {
      const downloadedYaml = path.join(TMP_DIR, "language.yaml");
      if (fs.existsSync(downloadedYaml)) {
        fs.unlinkSync(downloadedYaml);
      }

      const downloadFile = async (url, fileFullPath) => {
        logStatus(
          "downloading",
          url.includes(DCC_REFERENCE)
            ? url.replace(DCC_REFERENCE, DCC_PROTOCOL).replace(/\.ya?ml$/, "")
            : url
        );

        return new Promise((resolve, reject) => {
          https
            .get(url, (resp) => {
              // chunk received from the server
              resp.on("data", (chunk) => {
                fs.appendFileSync(fileFullPath, chunk);
              });

              // last chunk received, we are done
              resp.on("end", () => {
                if (resp.statusCode === 200) {
                  resolve("File downloaded and stored at: " + fileFullPath);
                } else {
                  reject(
                    new Error("Failed to download file: " + resp.statusMessage)
                  );
                }
              });
            })
            .on("error", (err) => {
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

    return yaml.load(fs.readFileSync(languageYaml, "utf8"));
  }

  function isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  function mergeDeep(target, source) {
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

  function mergeYaml(base, ext) {
    const newYaml = mergeDeep(base, ext);
    if (ext.language) {
      newYaml.language = ext.language;
    }
    return newYaml;
  }

  let resolvedYaml = await getYaml(ARGS.languageYaml);
  while (resolvedYaml?.extends) {
    const extendingYaml = await getYaml(resolvedYaml.extends);
    delete resolvedYaml.extends;
    resolvedYaml = mergeYaml(extendingYaml, resolvedYaml);
  }

  if (ARGS.devcontainerName) {
    if (!resolvedYaml.devcontainer) {
      resolvedYaml.devcontainer = {};
    }
    resolvedYaml.devcontainer.name = ARGS.devcontainerName;
  }

  logStatus("validating yaml");

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
  if (!resolvedYaml.vscode) {
    resolvedYaml.vscode = {};
  }
  if (!resolvedYaml.extras) {
    resolvedYaml.extras = [];
  }
  resolvedYaml.extras = resolvedYaml.extras.filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const ajv = new Ajv({
    useDefaults: true,
    removeAdditional: "all",
  });
  const schema = JSON.parse(
    fs.readFileSync(path.join(TMP_DIR, "language_schema.json"), "utf8")
  );
  const validate = ajv.compile(schema);

  try {
    if (!validate(resolvedYaml)) {
      throw new Error(
        "invalid yaml: " + JSON.stringify(validate.errors, undefined, 2)
      );
    }
  } catch (error) {
    logError(error.message);
    process.exit(1);
  }

  const baseImage = `ghcr.io/dhhyi/dcc-base-${resolvedYaml.devcontainer.build.base}:latest`;

  pullImage(baseImage, true);

  const baseDevcontainerMeta = getDevcontainerMeta(baseImage);
  const remoteUser = baseDevcontainerMeta.reduce(
    (acc, cur) => cur.remoteUser || acc,
    ""
  );
  if (remoteUser === resolvedYaml.devcontainer.remoteUser) {
    logWarn(`declaration of 'remoteUser: ${remoteUser}' is redundant`);
  } else if (!resolvedYaml.devcontainer.remoteUser) {
    resolvedYaml.devcontainer.remoteUser = remoteUser;
  }

  const inheritedExtensions = baseDevcontainerMeta.reduce((acc, cur) => {
    if (cur.customizations?.vscode?.extensions) {
      return acc.concat(cur.customizations.vscode.extensions);
    }
    return acc;
  }, []);
  if (resolvedYaml.vscode?.extensions) {
    resolvedYaml.vscode.extensions.forEach((ext) => {
      if (inheritedExtensions.includes(ext)) {
        logWarn(`extension '${ext}' is already inherited`);
      }
    });
  }

  if (ARGS.pinImage) {
    const pinnedImage = cp
      .execSync(
        `docker inspect ${baseImage} --format='{{index .RepoDigests 0}}'`
      )
      .toString()
      .trim();
    resolvedYaml.devcontainer.build.base = pinnedImage;
  }

  fs.writeFileSync(TMP_YAML_FILE, yaml.dump(resolvedYaml));

  if (VERBOSE) {
    logPersist("Resolved YAML:");
    logPersist(yaml.dump(resolvedYaml));
  }
}

function writeUpdateScript() {
  logStatus("writing update script");

  let relativeYamlPath;
  if (ARGS.languageYaml.startsWith(DCC_PROTOCOL)) {
    relativeYamlPath = ARGS.languageYaml;
  } else {
    relativeYamlPath = path.relative(ARGS.targetDir, ARGS.languageYaml);
  }

  const updateArgs = [relativeYamlPath, "."];
  if (ARGS.fullDevcontainer) {
    updateArgs.push("--full");
  }
  if (ARGS.devcontainerName) {
    updateArgs.push("--name", ARGS.devcontainerName);
  }
  updateArgs.push('"$@"');

  const updateArgsString = updateArgs
    .map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))
    .join(" ");

  const updateScriptPath = path.join(ARGS.targetDir, ".update_devcontainer.sh");
  fs.writeFileSync(
    updateScriptPath,
    `#!/bin/sh -e

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - ${updateArgsString}
`
  );
  fs.chmodSync(updateScriptPath, "755");
}

async function writeDevcontainer() {
  const templates = await extractResources(TMP_DIR);

  await resolveAndValidateYaml();

  logStatus("creating backups");
  templates.forEach((template) => {
    const templatePath = path.join(ARGS.targetDir, template);
    if (fs.existsSync(templatePath)) {
      fs.renameSync(templatePath, templatePath + "~");
    }
  });

  logStatus("executing gomplate");
  const gomplateBin = path.join(
    TMP_DIR,
    "node_modules/gomplate/node_modules/.bin/gomplate"
  );

  const gomplateCmd = [
    gomplateBin,
    `--input-dir ${TMP_DIR}`,
    '--include "**/*.gomplate"',
    `--output-map=${ARGS.targetDir}'/{{ .in | strings.TrimSuffix ".gomplate" }}'`,
    `-d language=${TMP_YAML_FILE}`,
  ].join(" ");
  if (VERBOSE) {
    logPersist("executing", gomplateCmd);
  }
  cp.execSync(gomplateCmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      GOMPLATE_SUPPRESS_EMPTY: "true",
      SIMPLE_IMAGE: ARGS.simpleImage,
    },
  });

  logStatus("removing backups");
  templates.forEach((template) => {
    const templatePath = path.join(ARGS.targetDir, template + "~");
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
    }
  });

  const resolvedYaml = yaml.load(fs.readFileSync(TMP_YAML_FILE));

  if (resolvedYaml?.devcontainer?.build?.files) {
    const files = resolvedYaml.devcontainer.build.files;
    Object.entries(files).forEach(([file, content]) => {
      const filePath = path.join(ARGS.targetDir, ".devcontainer", file);
      fs.writeFileSync(filePath, content);
    });
  }

  writeUpdateScript();

  logPersist("wrote devcontainer to", ARGS.targetDir);
}

function buildWithDevcontainerCli() {
  const devcontainerCliBin = path.join(
    TMP_DIR,
    "node_modules/.bin/devcontainer"
  );
  const devcontainerArgs = ["build", "--workspace-folder", ARGS.targetDir];
  if (ARGS.tag) {
    devcontainerArgs.push("--image-name", ARGS.tag);
  }

  if (ARGS.cacheFrom) {
    devcontainerArgs.push("--cache-from", ARGS.cacheFrom);

    pullImage(ARGS.cacheFrom);
  }

  if (VERBOSE) {
    logPersist("executing", devcontainerCliBin, ...devcontainerArgs);
  }

  logStatus("building devcontainer");
  const build = cp.spawnSync(devcontainerCliBin, devcontainerArgs);

  if (VERBOSE) {
    logPersist(build.stderr.toString());
  }

  if (build.status !== 0) {
    logError("error building devcontainer:", build.stderr.toString());
    process.exit(1);
  }

  const devcontainerOutput = JSON.parse(build.stdout.toString());
  const image = devcontainerOutput.imageName[0];
  logPersist("built image", image);

  return image;
}

function testDevcontainer(image) {
  logPersist("testing devcontainer");

  const devcontainerCliBin = path.join(
    TMP_DIR,
    "node_modules/.bin/devcontainer"
  );

  const testingTmpDir = path.join(TMP_DIR, "testing");
  fs.mkdirSync(testingTmpDir);
  fs.writeFileSync(
    path.join(testingTmpDir, ".devcontainer.json"),
    JSON.stringify({ image })
  );

  const devcontainerUpArgs = ["up", "--workspace-folder", testingTmpDir];

  if (VERBOSE) {
    logPersist("executing", devcontainerCliBin, ...devcontainerUpArgs);
  }

  const devcontainerUp = cp.spawnSync(devcontainerCliBin, devcontainerUpArgs);

  if (VERBOSE) {
    logPersist(devcontainerUp.stderr.toString());
  }

  if (devcontainerUp.status !== 0) {
    logError("error starting devcontainer");
    if (!VERBOSE) {
      logPersist(devcontainerUp.stderr.toString());
    }
    process.exit(1);
  }

  const containerId = JSON.parse(devcontainerUp.stdout.toString()).containerId;

  const devcontainerTestArgs = [
    "exec",
    "--workspace-folder",
    testingTmpDir,
    "/selftest.sh",
  ];

  if (VERBOSE) {
    logPersist("executing", devcontainerCliBin, ...devcontainerTestArgs);
  }

  try {
    cp.execSync(`${devcontainerCliBin} ${devcontainerTestArgs.join(" ")}`, {
      stdio: "inherit",
    });
  } catch (error) {
    logError("error testing devcontainer");
    process.exit(1);
  } finally {
    cp.execSync(`docker rm -f ${containerId}`, {
      stdio: "ignore",
    });
  }
}

function buildAndTest() {
  if (!ARGS.build) {
    return;
  }

  const image = buildWithDevcontainerCli();

  if (ARGS.dumpMeta) {
    const meta = getDevcontainerMeta(image);
    const metaFile = path.join(ARGS.targetDir, ".devcontainer_meta.json");
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
  }

  if (ARGS.test) {
    testDevcontainer(image);
  }
}

installTools();

await writeDevcontainer();

buildAndTest();

if (process.stdout.clearLine) {
  logStatus("done\n");
} else {
  console.timeEnd("dcc");
}
