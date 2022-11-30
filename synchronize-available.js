const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const bases = fs
  .readdirSync('./base-images')
  .filter((f) => fs.statSync(path.join('base-images', f)).isDirectory())
  .map((f) => `base://${f}`);

const langs = fs
  .readdirSync('./examples')
  .filter(
    (f) =>
      fs.statSync(path.join('examples', f)).isFile() &&
      path.extname(f) === '.yaml'
  )
  .map((f) => `dcc://${path.basename(f, '.yaml')}`);

const available = [...bases, ...langs].sort();

const schemaPath = path.join('templates', 'language_schema.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
schema.properties.extends.enum = available;
fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n');

try {
  cp.execSync(`git diff --exit-code --raw -p --stat ${schemaPath}`, {
    stdio: 'inherit',
  });
} catch (error) {
  console.log('schema was not in sync, I updated it for you');
  process.exit(1);
}
