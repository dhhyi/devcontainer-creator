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
  if (process.argv[2] === '--skip') {
    const skipped = process.argv[3].split(',');
    langs = langs.filter((x) => !skipped.includes(x));
  }
  console.log(`languages=${JSON.stringify(langs)}`);
  allLanguages().forEach((lang) => {
    console.log(
      `dcc${lang.substring(0, 1).toUpperCase()}${lang.substring(
        1
      )}=${langs.includes(lang)}`
    );
  });
  console.log(`buildLanguages=${!!langs.length}`);
  console.log(`buildBase=${buildBase}`);
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
      [
        'package.json',
        'webpack.config.js',
        'tsconfig.json',
        'language_schema.json',
      ].includes(x)
    ) ||
    changed.some((x) => ['src/'].some((p) => x.startsWith(p)))
  ) {
    output(allLanguages(), buildBase);
  } else if (changed.some((x) => x.startsWith('examples/'))) {
    const transitive = transitiveLanguages();

    const build = changed
      .filter((x) => x.startsWith('examples/'))
      .map((x) => x.replace(/^examples\//, '').replace(/\.yaml$/, ''));

    const buildWithTransitive = [];
    for (const lang of build) {
      buildWithTransitive.push(lang);
      transitive[lang].forEach((x) => buildWithTransitive.push(x));
    }

    output(buildWithTransitive.filter((v, i, a) => a.indexOf(v) === i));
  } else {
    output();
  }

  fallback.unref();
});
