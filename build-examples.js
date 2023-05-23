const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const skipLanguagesRaw =
  process.env.npm_config_skip_languages ||
  JSON.parse(fs.readFileSync('package.json')).config?.['skip-languages'];
const skipLanguages = skipLanguagesRaw?.split(',') || [];

const languages = fs
  .readdirSync('examples')
  .filter(
    (x) => x.endsWith('.yaml') && fs.statSync(path.join('examples', x)).isFile()
  )
  .map((x) => x.replace(/\.yaml$/, ''))
  .filter((x) => !skipLanguages.includes(x));

const commandArgs = (lang) => [
  'dist/bundle.js',
  `https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/examples/${lang}.yaml`,
  `dist/test/${lang}`,
  '--dump-meta',
  '--name',
  `Example devcontainer for ${lang}`,
  '--cache-from',
  `ghcr.io/dhhyi/dcc-devcontainer-${lang}:latest`,
];

let failed = false;

for (const lang of languages) {
  console.log(`Building ${lang}...`);
  const proc = cp.spawnSync('node', commandArgs(lang), {
    stdio: 'inherit',
  });

  if (proc.status !== 0) {
    console.error(`Failed to build ${lang}!`);

    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
