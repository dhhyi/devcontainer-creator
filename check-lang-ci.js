const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function allLanguages() {
  return fs
    .readdirSync('examples')
    .filter(
      (x) =>
        x.endsWith('.yaml') && fs.statSync(path.join('examples', x)).isFile()
    )
    .map((x) => x.replace(/\.yaml$/, ''));
}

function baseImages() {
  return fs.readdirSync('base-images').filter((x) => x !== 'debian');
}

function transitiveLanguages() {
  const langs = allLanguages();
  const transitive = {};
  for (const lang of langs) {
    transitive[lang] = [];
  }
  for (const lang of langs) {
    const languageYaml = yaml.load(
      fs.readFileSync(path.join('examples', lang + '.yaml'))
    );
    if (languageYaml.extends) {
      const ext = languageYaml.extends;
      if (ext.startsWith('dcc://')) {
        transitive[ext.replace('dcc://', '')].push(lang);
      }
    }
  }
  return transitive;
}

function output(langs = [], buildBase = false) {
  let array = [...langs].sort();
  if (process.argv[2] === '--skip') {
    const skipped = process.argv[3].split(',');
    array = array.filter((x) => !skipped.includes(x));
  }
  console.log(`languages=${JSON.stringify(array)}`);
  console.log(`buildLanguages=${!!array.length}`);
  console.log(`buildBase=${buildBase}`);
  console.log(`baseImages=${JSON.stringify(baseImages())}`);
  process.exit(0);
}

const fallback = setTimeout(() => {
  output(allLanguages());
}, 2000);

const stdin = process.openStdin();
let data = '';
stdin.on('data', function (chunk) {
  data += chunk;
});

stdin.on('end', function () {
  const changed = data.split('\n').filter((x) => x);

  const buildBase = changed.some(
    (x) =>
      ['.github/workflows/publish.yaml', 'check-lang-ci.js'].includes(x) ||
      ['base-images/', 'features/'].some((p) => x.startsWith(p))
  );

  if (
    buildBase ||
    changed.some((x) =>
      ['package.json', 'webpack.config.js', 'tsconfig.json'].includes(x)
    ) ||
    changed.some((x) => ['templates/', 'src/'].some((p) => x.startsWith(p)))
  ) {
    output(allLanguages(), buildBase);
  } else if (changed.some((x) => x.startsWith('examples/'))) {
    const transitive = transitiveLanguages();

    const build = changed
      .filter((x) => x.startsWith('examples/'))
      .map((x) => x.replace(/^examples\//, '').replace(/\.yaml$/, ''));

    const buildWithTransitive = new Set();
    for (const lang of build) {
      buildWithTransitive.add(lang);
      transitive[lang].forEach((x) => buildWithTransitive.add(x));
    }

    output(buildWithTransitive);
  } else {
    output();
  }

  fallback.unref();
});
