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

  console.log("wrote templates to", dir);
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
                reject("Failed to download file: " + resp.statusMessage);
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

  return { languageYaml, targetDir, extraArgs };
}

const { languageYaml, targetDir, extraArgs } = parseArgs();

const dir = path.join(os.tmpdir(), "devcontainer-creator");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

try {
  console.log("installing tools");
  cp.execSync("npm install --no-save gomplate pajv", {
    stdio: "ignore",
    cwd: dir,
  });
} catch (error) {
  console.log("error installing dependencies:", error.message);
  process.exit(1);
}

await extractResources(dir);

let simpleImage = "";
if (languageYaml.startsWith("dcc://") && !extraArgs.includes("--full")) {
  const lang = languageYaml.substring(6);
  simpleImage = `ghcr.io/dhhyi/dcc-devcontainer-${lang}:latest`;
}

let resolvedYaml = await getYaml(languageYaml);
while (resolvedYaml["extends"]) {
  const extendingYaml = await getYaml(resolvedYaml["extends"]);
  delete resolvedYaml["extends"];
  resolvedYaml = mergeYaml(extendingYaml, resolvedYaml);
}

const resolvedYamlPath = path.join(dir, "language.yaml");
fs.writeFileSync(resolvedYamlPath, yaml.dump(resolvedYaml));

const pajvBin = path.join(dir, "node_modules/.bin/pajv");

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

const gomplateBin = path.join(
  dir,
  "node_modules/gomplate/node_modules/.bin/gomplate"
);

cp.execSync(
  [
    gomplateBin,
    `--input-dir ${dir}`,
    '--include "**/*.gomplate"',
    `--output-map=${targetDir}'/{{ .in | strings.TrimSuffix ".gomplate" }}'`,
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

if (resolvedYaml?.devcontainer?.build?.files) {
  const files = resolvedYaml.devcontainer.build.files;
  Object.entries(files).forEach(([file, content]) => {
    const filePath = path.join(targetDir, ".devcontainer", file);
    fs.writeFileSync(filePath, content);
  });
}

function relativeYamlPath() {
  if (languageYaml.startsWith("dcc://")) {
    return languageYaml;
  } else {
    return path.relative(targetDir, languageYaml);
  }
}

const updateArgs = [relativeYamlPath(), ".", ...extraArgs].join(" ");
fs.writeFileSync(
  path.join(targetDir, ".update_devcontainer.sh"),
  `#!/bin/sh

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - ${updateArgs}
`
);

console.log("wrote devcontainer to", targetDir);
