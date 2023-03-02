const cp = require('child_process');
const fs = require('fs');
const path = require('path');

cp.execSync('npm exec pnpm install');

const rules = {
  '*': [
    () => 'npm run format',
    () => 'node synchronize-available.js',
    () => 'node pipeline.js',
  ],
  '*.{js,ts}': ['eslint --fix --max-warnings=0'],
};

if (cp.spawnSync('shellcheck', ['--version']).status === 0) {
  rules['*.sh'] = ['shellcheck'];
}

rules['features/**'] = [() => 'devcontainer features test features'];

rules['examples/**'] = [
  (files) => [
    ...files.map(
      (file) => `npm run validate-yaml examples/${path.basename(file)}`
    ),
  ],
];
rules['language_schema.json'] = [
  () => [
    ...fs
      .readdirSync('examples')
      .map((file) => `npm run validate-yaml examples/${file}`),
  ],
];

module.exports = rules;
