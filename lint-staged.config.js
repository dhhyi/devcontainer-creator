const cp = require("child_process");

const rules = {
  "*": ["prettier --write"],
  "*.{mjs,js}": ["eslint --fix"],
};

if (cp.spawnSync("shellcheck", ["--version"]).status === 0) {
  rules["*.sh"] = ["shellcheck"];
}

rules["features/**"] = [() => "devcontainer features test features"];

module.exports = rules;
