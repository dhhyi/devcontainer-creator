const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function isArrayEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

const languages = fs
  .readdirSync("examples")
  .filter(
    (x) => x.endsWith(".yaml") && fs.statSync(path.join("examples", x)).isFile()
  )
  .map((x) => x.replace(/\.yaml$/, ""))
  .sort();

const workflowFilePath = path.join(".github", "workflows", "publish.yaml");
const workflowFile = fs.readFileSync(workflowFilePath, "utf8");
const workflow = yaml.load(workflowFile);

const workflowLanguages = workflow.jobs.test.strategy.matrix.lang;

if (!isArrayEqual(languages, workflowLanguages)) {
  console.error(
    "Languages in examples/ and .github/workflows/publish.yaml are not equal"
  );

  const newWorkflowFile = workflowFile.replace(
    /lang: \[.*/,
    `lang: [${languages.join(", ")}]`
  );

  fs.writeFileSync(workflowFilePath, newWorkflowFile, "utf8");
  process.exit(1);
}

console.log("OK");
