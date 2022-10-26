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
  const build = extraArgs.includes("--build") || test || tag;
  const cacheFromArg = extraArgs.findIndex((arg) => arg === "--cache-from");
  const cacheFrom = cacheFromArg >= 0 && extraArgs[cacheFromArg + 1];

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
  };
}

const ARGS = parseArgs();

function createTmpDir() {
  const dir = path.join(os.tmpdir(), "devcontainer-creator");
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
    cp.execSync(`npm install --no-save ${tools.join(" ")}`, {
      stdio: "ignore",
      cwd: TMP_DIR,
    });
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
    ".devcontainer/selftest.sh.gomplate": import(
      "./templates/.devcontainer/selftest.sh.gomplate"
    ),
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

function buildAndTest() {
  if (!ARGS.build) {
    return;
  }

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

    logStatus("pulling cache image");

    const cachePull = cp.spawnSync("docker", ["pull", ARGS.cacheFrom]);

    if (cachePull.status !== 0) {
      logPersist("cache image does not exist");
    }

    if (VERBOSE) {
      logPersist(cachePull.stderr.toString());
      logPersist(cachePull.stdout.toString());
    }
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

  if (ARGS.test) {
    logPersist("testing devcontainer");
    try {
      cp.execSync(`docker run --rm ${image} /selftest.sh`, {
        stdio: "inherit",
      });
    } catch (error) {
      logError("error testing devcontainer:", error.message);
      process.exit(1);
    }
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
