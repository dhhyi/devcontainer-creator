const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function allLanguages() {
  return fs
    .readdirSync("examples")
    .filter(
      (x) =>
        x.endsWith(".yaml") && fs.statSync(path.join("examples", x)).isFile()
    )
    .map((x) => x.replace(/\.yaml$/, ""));
}

function transitiveLanguages() {
  const langs = allLanguages();
  const transitive = {};
  for (const lang of langs) {
    transitive[lang] = [];
  }
  for (const lang of langs) {
    const languageYaml = yaml.load(
      fs.readFileSync(path.join("examples", lang + ".yaml"))
    );
    if (languageYaml.extends) {
      const ext = languageYaml.extends;
      if (ext.startsWith("dcc://")) {
        transitive[ext.replace("dcc://", "")].push(lang);
      }
    }
  }
  return transitive;
}

function output(langs = []) {
  const variable = process.argv[2] || "languages";
  const array = [...langs].sort();
  console.log(`${variable}=${JSON.stringify(array)}`);
  console.log(`skip=${!array.length}`);
  process.exit(0);
}

const fallback = setTimeout(() => {
  output(allLanguages());
}, 2000);

const stdin = process.openStdin();
let data = "";
stdin.on("data", function (chunk) {
  data += chunk;
});

stdin.on("end", function () {
  const changed = data.split("\n").filter((x) => x);
  if (
    changed.some((x) =>
      [
        ".github/workflows/publish.yaml",
        "check-lang-ci.js",
        "create.mjs",
        "package.json",
      ].includes(x)
    ) ||
    changed.some((x) =>
      ["templates/", "features/"].some((p) => x.startsWith(p))
    )
  ) {
    output(allLanguages());
  } else if (changed.some((x) => x.startsWith("examples/"))) {
    const transitive = transitiveLanguages();

    const build = changed
      .filter((x) => x.startsWith("examples/"))
      .map((x) => x.replace(/^examples\//, "").replace(/\.yaml$/, ""));

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
