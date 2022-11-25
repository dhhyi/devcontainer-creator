const cp = require('child_process');

const rules = {
  '*': [() => 'npm run format'],
  '*.{js,ts}': ['eslint --fix --max-warnings=0'],
};

if (cp.spawnSync('shellcheck', ['--version']).status === 0) {
  rules['*.sh'] = ['shellcheck'];
}

rules['features/**'] = [() => 'devcontainer features test features'];

module.exports = rules;
