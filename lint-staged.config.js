const cp = require('child_process');
const path = require('path');

cp.execSync('pnpm install');

const rules = {
  '*': [() => 'pnpm run format', () => 'pnpm run synchronize-ci'],
  '*.{js,ts}': ['eslint --fix --max-warnings=0'],
};

if (cp.spawnSync('shellcheck', ['--version']).status === 0) {
  rules['*.sh'] = ['shellcheck'];
}

rules['features/**'] = [() => 'devcontainer features test features'];

rules['examples/**'] = [
  (files) => [
    ...files.flatMap((file) => [
      `pnpm run validate-yaml examples/${path.basename(file)}`,
      `node check-language ${file}`,
    ]),
  ],
];

const { globSync } = require('glob');

rules['language_schema.json'] = [
  () =>
    globSync(
      '{examples/*.yaml,tests/!(empty|extra_properties|multi-yaml)/language.yaml}'
    ).map((file) => `pnpm run validate-yaml ${file}`),
];

module.exports = rules;
