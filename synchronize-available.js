const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const skipLanguagesRaw =
  process.env.npm_config_skip_languages ||
  JSON.parse(fs.readFileSync('package.json')).config?.['skip-languages'];
const skipLanguages = skipLanguagesRaw?.split(',') || [];

const bases = fs
  .readdirSync('./base-images')
  .filter((f) => fs.statSync(path.join('base-images', f)).isDirectory())
  .map((f) => `base://${f}`);

const langs = fs
  .readdirSync('./examples')
  .filter(
    (f) =>
      fs.statSync(path.join('examples', f)).isFile() &&
      path.extname(f) === '.yaml' &&
      !skipLanguages.includes(path.basename(f, '.yaml'))
  )
  .map((f) => `dcc://${path.basename(f, '.yaml')}`);

const available = [...bases, ...langs].sort();

const schemaPath = 'language_schema.json';

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
schema.properties.extends.enum = available;
fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n');

try {
  cp.execSync(`git diff --exit-code --raw -p --stat ${schemaPath}`, {
    stdio: 'inherit',
  });
} catch (_error) {
  console.log('schema was not in sync, I updated it for you');
  process.exit(1);
}
