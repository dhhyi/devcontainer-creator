const cp = require('child_process');

cp.execSync('npm exec pnpm install');

const rules = {
  '*': [() => 'npm run format', () => 'node synchronize-available.js'],
  '*.{js,ts}': ['eslint --fix --max-warnings=0'],
};

if (cp.spawnSync('shellcheck', ['--version']).status === 0) {
  rules['*.sh'] = ['shellcheck'];
}

rules['features/**'] = [() => 'devcontainer features test features'];

rules['examples/**'] = [
  (files) => [
    ...files.map(
      (file) =>
        `npm exec -- ajv validate -d ${file} -s templates/language_schema.json --errors=text --verbose`
    ),
  ],
];

module.exports = rules;
