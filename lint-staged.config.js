const cp = require('child_process');
const path = require('path');

cp.execSync('npm exec pnpm install');

const rules = {
  '*': [() => 'npm run format', () => 'npm run synchronize-ci'],
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

const { globSync } = require('glob');

rules['language_schema.json'] = [
  () =>
    globSync(
      '{examples/*.yaml,tests/!(empty|extra_properties|multi-yaml)/language.yaml}'
    ).map((file) => `npm run validate-yaml ${file}`),
];

module.exports = rules;
