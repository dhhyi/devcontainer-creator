const os = require("os");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const { argv } = require("process");
const https = require("https");

if (argv.length < 4) {
  console.log("Usage: node create.js <language.yaml> <target-folder>");
  process.exit(1);
}

let languageYaml = argv[2];
const targetDir = argv[3];

const dir = path.join(os.tmpdir(), "devcontainer-creator");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

cp.execSync("npm install --no-save gomplate pajv", {
  stdio: "inherit",
  cwd: dir,
});

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
  // "workflow.yml.gomplate": import("./templates/workflow.yml.gomplate"),
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

const pajvBin = path.join(dir, "node_modules/.bin/pajv");

if (languageYaml.startsWith("root:")) {
  languageYaml =
    "https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/examples/" +
    languageYaml.substring(5);
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
    console.info("downloading file from url: " + url);

    return new Promise((resolve, reject) => {
      https
        .get(url, (resp) => {
          // chunk received from the server
          resp.on("data", (chunk) => {
            fs.appendFileSync(fileFullPath, chunk);
          });

          // last chunk received, we are done
          resp.on("end", () => {
            resolve("File downloaded and stored at: " + fileFullPath);
          });
        })
        .on("error", (err) => {
          reject(new Error(err.message));
        });
    });
  };
  await downloadFile(languageYaml, downloadedYaml);
  languageYaml = downloadedYaml;
}

cp.execSync(
  [
    pajvBin,
    "validate",
    `-s ${path.join(dir, "language_schema.json")}`,
    `-d ${languageYaml}`,
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
    `-d language=${languageYaml}`,
    `-d vscodesettings=${dir}/.devcontainer/vscode.default.settings.json`,
  ].join(" "),
  { stdio: "inherit", env: { ...process.env, GOMPLATE_SUPPRESS_EMPTY: "true" } }
);
