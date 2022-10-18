import * as yaml from "js-yaml";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as cp from "child_process";
import * as https from "https";

async function extractResources(dir) {
  const resources = {
    ".devcontainer/cont.sh.gomplate": import(
      "./templates/.devcontainer/cont.sh.gomplate"
    ),
    ".devcontainer/devcontainer.json.gomplate": import(
      "./templates/.devcontainer/devcontainer.json.gomplate"
    ),
    ".devcontainer/disclaimer.sh.gomplate": import(
      "./templates/.devcontainer/disclaimer.sh.gomplate"
    ),
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
    ".devcontainer/vscode.default.settings.json": import(
      "./templates/.devcontainer/vscode.default.settings.json"
    ),
    "language_schema.json": import("./templates/language_schema.json"),
  };

  console.log("writing templates to", dir);

  await Promise.all(
    Object.entries(resources).map(([filename, content]) => {
      const file = path.join(dir, filename);
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

async function getYaml(languageYaml) {
  if (languageYaml.startsWith("dcc://")) {
    languageYaml =
      "https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/examples/" +
      languageYaml.substring(6);
    if (!languageYaml.endsWith(".yaml")) {
      languageYaml += ".yaml";
    }
  }

  if (languageYaml.startsWith("http")) {
    const downloadedYaml = path.join(dir, "language.yaml");
    if (fs.existsSync(downloadedYaml)) {
      fs.unlinkSync(downloadedYaml);
    }

    const downloadFile = async (url, fileFullPath) => {
      console.info("downloading", url);

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
      console.error(error);
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
        output = { ...output, [key]: [...(target[key] || []), ...source[key]] };
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

if (process.argv.length < 4) {
  console.log("Usage: node create.js <language.yaml> <target-folder>");
  process.exit(1);
}

function parseArgs() {
  const argv = process.argv.slice(2);

  const languageYaml = argv[0];
  const targetDir = argv[1];
  const extraArgs = argv.slice(2);
  const fullDevcontainer = extraArgs.includes("--full");
  const simplified = languageYaml.startsWith("dcc://") && !fullDevcontainer;
  const devcontainerNameArg = extraArgs.findIndex((arg) => arg === "--name");
  const devcontainerName =
    devcontainerNameArg >= 0 && extraArgs[devcontainerNameArg + 1];
  const test = extraArgs.includes("--test");
  const tagArg = extraArgs.findIndex((arg) => arg === "--tag");
  const tag = tagArg >= 0 && extraArgs[tagArg + 1];
  const build = extraArgs.includes("--build") || test || tag;

  return {
    languageYaml,
    targetDir,
    simplified,
    fullDevcontainer,
    devcontainerName,
    build,
    test,
    tag,
  };
}

const a = parseArgs();

const dir = path.join(os.tmpdir(), "devcontainer-creator");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const tools = ["gomplate", "pajv"];
if (a.build) {
  tools.push("@devcontainers/cli");
}

try {
  console.log("installing tools");
  cp.execSync(`npm install --no-save ${tools.join(" ")}`, {
    stdio: "ignore",
    cwd: dir,
  });
} catch (error) {
  console.log("error installing dependencies:", error.message);
  process.exit(1);
}

const templates = await extractResources(dir);

let simpleImage = "";
if (a.simplified) {
  const lang = a.languageYaml.substring(6);
  simpleImage = `ghcr.io/dhhyi/dcc-devcontainer-${lang}:latest`;
}

let resolvedYaml = await getYaml(a.languageYaml);
while (resolvedYaml.extends) {
  const extendingYaml = await getYaml(resolvedYaml.extends);
  delete resolvedYaml.extends;
  resolvedYaml = mergeYaml(extendingYaml, resolvedYaml);
}

if (a.devcontainerName) {
  if (!resolvedYaml.devcontainer) {
    resolvedYaml.devcontainer = {};
  }
  resolvedYaml.devcontainer.name = a.devcontainerName;
}

const resolvedYamlPath = path.join(dir, "language.yaml");
fs.writeFileSync(resolvedYamlPath, yaml.dump(resolvedYaml));

const pajvBin = path.join(dir, "node_modules/.bin/pajv");

console.log("validating yaml");
cp.execSync(
  [
    pajvBin,
    "validate",
    `-s ${path.join(dir, "language_schema.json")}`,
    `-d ${resolvedYamlPath}`,
    "--errors=text",
    "--verbose",
  ].join(" "),
  { stdio: "inherit" }
);

console.log("creating backups");
templates.forEach((template) => {
  const templatePath = path.join(a.targetDir, template);
  if (fs.existsSync(templatePath)) {
    fs.renameSync(templatePath, templatePath + "~");
  }
});

console.log("executing gomplate");
const gomplateBin = path.join(
  dir,
  "node_modules/gomplate/node_modules/.bin/gomplate"
);

cp.execSync(
  [
    gomplateBin,
    `--input-dir ${dir}`,
    '--include "**/*.gomplate"',
    `--output-map=${a.targetDir}'/{{ .in | strings.TrimSuffix ".gomplate" }}'`,
    `-d language=${resolvedYamlPath}`,
    `-d vscodesettings=${dir}/.devcontainer/vscode.default.settings.json`,
  ].join(" "),
  {
    stdio: "inherit",
    env: {
      ...process.env,
      GOMPLATE_SUPPRESS_EMPTY: "true",
      SIMPLE_IMAGE: simpleImage,
    },
  }
);

console.log("removing backups");
templates.forEach((template) => {
  const templatePath = path.join(a.targetDir, template + "~");
  if (fs.existsSync(templatePath)) {
    fs.unlinkSync(templatePath);
  }
});

if (resolvedYaml?.devcontainer?.build?.files) {
  const files = resolvedYaml.devcontainer.build.files;
  Object.entries(files).forEach(([file, content]) => {
    const filePath = path.join(a.targetDir, ".devcontainer", file);
    fs.writeFileSync(filePath, content);
  });
}

function relativeYamlPath() {
  if (a.languageYaml.startsWith("dcc://")) {
    return a.languageYaml;
  } else {
    return path.relative(a.targetDir, a.languageYaml);
  }
}

const updateArgs = [relativeYamlPath(), "."];
if (a.fullDevcontainer) {
  updateArgs.push("--full");
}
if (a.devcontainerName) {
  updateArgs.push("--name", a.devcontainerName);
}
updateArgs.push('"$@"');

const updateArgsString = updateArgs
  .map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))
  .join(" ");

fs.writeFileSync(
  path.join(a.targetDir, ".update_devcontainer.sh"),
  `#!/bin/sh

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - ${updateArgsString}
`
);

console.log("wrote devcontainer to", a.targetDir);

if (a.build) {
  console.log("building devcontainer");
  const devcontainerCliBin = path.join(dir, "node_modules/.bin/devcontainer");
  const devcontainerArgs = ["build", "--workspace-folder", a.targetDir];
  if (a.tag) {
    devcontainerArgs.push("--image-name", a.tag);
  }

  const build = cp.spawnSync(devcontainerCliBin, devcontainerArgs);

  if (build.status !== 0) {
    console.log("error building devcontainer:", build.stderr.toString());
    process.exit(1);
  }

  const devcontainerOutput = JSON.parse(build.stdout.toString());
  const image = devcontainerOutput.imageName[0];
  console.log("built image", image);

  if (a.test) {
    console.log("testing devcontainer");
    try {
      cp.execSync(`docker run --rm ${image} sh /selftest.sh`, {
        stdio: "inherit",
      });
    } catch (error) {
      console.log("error testing devcontainer:", error.message);
      process.exit(1);
    }
  }
}
