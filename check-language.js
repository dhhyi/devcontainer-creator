const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const languageFile = process.argv[2];
if (!languageFile) {
  console.error('No language file specified');
  process.exit(1);
} else if (!fs.existsSync(languageFile)) {
  console.error('Language file does not exist');
  process.exit(1);
}

const languageContent = fs.readFileSync(languageFile, 'utf8');
const language = yaml.load(languageContent);

const nameFromFilename = path.basename(languageFile, '.yaml');
console.log(`Checking language file ${nameFromFilename}...`);

const expectedPublishContent = {
  image: `dcc://${nameFromFilename}`,
  labels: {
    'org.opencontainers.image.source':
      'https://github.com/dhhyi/devcontainer-creator',
    'org.opencontainers.image.description': `VSCode devcontainer for ${nameFromFilename}`,
  },
};

const dumpOptions = { sortKeys: true, flowLevel: -1, lineWidth: -1 };
const publish = yaml.dump(language?.devcontainer?.publish, dumpOptions);
const expected = yaml.dump(expectedPublishContent, dumpOptions);

if (publish !== expected) {
  console.error(
    'devcontainer.publish does not match expected content',
    publish,
    expectedPublishContent
  );
  console.log(
    'Expected:',
    '\n',
    yaml.dump({ publish: expectedPublishContent }, dumpOptions)
  );
  if (!language?.devcontainer?.publish) {
    console.log('trying to fix...');
    const newContent = languageContent.replace(
      'devcontainer:',
      yaml
        .dump(
          { devcontainer: { publish: expectedPublishContent } },
          dumpOptions
        )
        .trim()
    );
    fs.writeFileSync(languageFile, newContent);
  }
  process.exit(1);
}
