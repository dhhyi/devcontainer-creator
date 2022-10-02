const os = require("os");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const { argv } = require("process");

if (argv.length < 4) {
  console.log("Usage: node create.js <language.yaml> <target-folder>");
  process.exit(1);
}

const languageYaml = argv[2];
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
  ".devcontainer/cont.sh.gomplate": require("./templates/.devcontainer/cont.sh.gomplate"),
  ".devcontainer/devcontainer.json.gomplate": require("./templates/.devcontainer/devcontainer.json.gomplate"),
  ".devcontainer/disclaimer.sh.gomplate": require("./templates/.devcontainer/disclaimer.sh.gomplate"),
  ".devcontainer/Dockerfile.gomplate": require("./templates/.devcontainer/Dockerfile.gomplate"),
  ".devcontainer/selftest.sh.gomplate": require("./templates/.devcontainer/selftest.sh.gomplate"),
  ".vscode/tasks.json.gomplate": require("./templates/.vscode/tasks.json.gomplate"),
  ".vscode/vscode.code-snippets.gomplate": require("./templates/.vscode/vscode.code-snippets.gomplate"),
  // "workflow.yml.gomplate": require("./templates/workflow.yml.gomplate"),
  ".devcontainer/vscode.default.settings.json": require("./templates/.devcontainer/vscode.default.settings.json"),
  "language_schema.json": require("./templates/language_schema.json"),
};

Object.entries(resources).forEach(([filename, content]) => {
  const file = path.join(dir, filename);
  if (!fs.existsSync(path.dirname(file))) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  fs.writeFileSync(file, content.default);
});

console.log("wrote templates to", dir);

const pajvBin = path.join(dir, "node_modules/.bin/pajv");

cp.execSync(
  `${pajvBin} validate -s ${path.join(
    dir,
    "language_schema.json"
  )} -d ${languageYaml} --errors=text --verbose`,
  { stdio: "inherit" }
);

const gomplateBin = path.join(
  dir,
  "node_modules/gomplate/node_modules/.bin/gomplate"
);

cp.execSync(
  `${gomplateBin} --input-dir ${dir} --include "**/*.gomplate" --output-map=${targetDir}'/{{ .in | strings.TrimSuffix ".gomplate" }}' -d language=${languageYaml} -d vscodesettings=${dir}/.devcontainer/vscode.default.settings.json`,
  { stdio: "inherit", env: { ...process.env, GOMPLATE_SUPPRESS_EMPTY: "true" } }
);
