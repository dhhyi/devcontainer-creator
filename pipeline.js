/* eslint-disable no-template-curly-in-string */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const cp = require('child_process');

const BASE_PROTOCOL = 'base://';
const DCC_PROTOCOL = 'dcc://';
const PIPELINE_FILE = '.github/workflows/publish.yaml';

function languages() {
  return fs
    .readdirSync('examples')
    .filter(
      (x) =>
        x.endsWith('.yaml') && fs.statSync(path.join('examples', x)).isFile()
    )
    .map((x) => DCC_PROTOCOL + x.replace(/\.yaml$/, ''));
}

function bases() {
  return fs.readdirSync('base-images').map((x) => BASE_PROTOCOL + x);
}

function toFile(ref) {
  if (ref.startsWith(BASE_PROTOCOL)) {
    return 'base-images/' + ref.slice(BASE_PROTOCOL.length);
  } else if (ref.startsWith(DCC_PROTOCOL)) {
    return 'examples/' + ref.slice(DCC_PROTOCOL.length) + '.yaml';
  }
}

function readDependency(file) {
  if (file.startsWith('examples/')) {
    const languageYaml = yaml.load(fs.readFileSync(file, 'utf8'));
    return languageYaml.extends || BASE_PROTOCOL + 'debian';
  } else if (file.startsWith('base-images/')) {
    const devcontainerJson = JSON.parse(
      fs.readFileSync(path.join(file, '.devcontainer.json'), 'utf8')
    );

    let lookupImage;
    if (devcontainerJson.image) {
      lookupImage = devcontainerJson.image;
    } else if (devcontainerJson.build && devcontainerJson.build.dockerfile) {
      const dockerfilePath = path.join(file, devcontainerJson.build.dockerfile);
      const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
      const match = dockerfile.match(/^FROM (.*)$/m);
      if (match) {
        lookupImage = match[1];
      } else {
        throw new Error(`Could not find FROM statement in ${dockerfilePath}`);
      }
    }

    const baseImage = lookupImage.replace(
      'ghcr.io/dhhyi/dcc-base-',
      BASE_PROTOCOL
    );
    if (baseImage === lookupImage) {
      return 'features';
    } else {
      return baseImage;
    }
  }
}

function buildJob(ref) {
  return ref.replace(/:\/\/(\w)/, (_, p1) => p1.toUpperCase());
}

const workflow = {
  name: 'Publish',
  on: {
    push: { branches: ['main'] },
  },
  jobs: {
    calc: {
      'runs-on': 'ubuntu-latest',
      outputs: {
        buildLanguages: '${{ steps.check.outputs.buildLanguages }}',
        buildBase: '${{ steps.check.outputs.buildBase }}',
        ...languages().reduce((acc, lang) => {
          acc[buildJob(lang)] =
            '${{ steps.check.outputs.' + buildJob(lang) + ' }}';
          return acc;
        }, {}),
      },
      // find commits: https://github.com/orgs/community/discussions/25797
      // find commit length: https://github.com/orgs/community/discussions/27125
      env: {
        commits: '${{ toJSON(github.event.commits) }}',
      },
      steps: [
        { uses: 'actions/checkout@master', with: { 'fetch-depth': 0 } },
        {
          run: 'npm exec pnpm -- i --prod --ignore-scripts',
          name: 'npm install',
        },
        {
          run: 'node pipeline.js\ngit diff --exit-code',
          name: 'Check Pipeline',
        },
        // {
        //   name: 'Debug',
        //   run: 'echo "${{ toJSON(github) }}"',
        // },
        {
          run: 'noOfCommits=$(echo $commits | jq ". | length")\ngit diff --name-only HEAD~$noOfCommits',
          name: 'Report Changed Files',
        },
        {
          id: 'calculate',
          run: 'noOfCommits=$(echo $commits | jq ". | length")\ngit diff --name-only HEAD~$noOfCommits | node check-lang-ci.js >> $GITHUB_OUTPUT\ncat $GITHUB_OUTPUT',
          name: 'Calculate Required Jobs',
        },
      ],
    },
    bundle: {
      uses: './.github/workflows/bundle.yaml',
      secrets: 'inherit',
    },
    features: {
      needs: ['calc'],
      if: '${{ ! failure() && ! cancelled() && always() }}',
      uses: './.github/workflows/features.yaml',
      with: {
        skip: "${{ needs.calc.outputs.buildBase == 'false' }}",
      },
      secrets: 'inherit',
    },
  },
};

bases().forEach((ref) => {
  const file = toFile(ref);
  const dependency = readDependency(file);
  workflow.jobs[buildJob(ref)] = {
    needs: ['calc', buildJob(dependency)],
    if: '${{ ! failure() && ! cancelled() && always() }}',
    name: ref,
    uses: './.github/workflows/base.yaml',
    with: {
      name: ref.replace(BASE_PROTOCOL, ''),
      skip: "${{ needs.calc.outputs.buildBase == 'false' }}",
    },
    secrets: 'inherit',
  };
});

languages().forEach((ref) => {
  const file = toFile(ref);
  const dependency = readDependency(file);
  workflow.jobs[buildJob(ref)] = {
    needs: ['calc', 'bundle', buildJob(dependency)],
    if: '${{ ! failure() && ! cancelled() && always() }}',
    name: ref,
    uses: './.github/workflows/dcc.yaml',
    with: {
      name: ref.replace(DCC_PROTOCOL, ''),
      skip: '${{ needs.calc.outputs.' + buildJob(ref) + " == 'false' }}",
    },
    secrets: 'inherit',
  };
});

workflow.jobs.examples = {
  needs: ['calc', ...languages().map((x) => buildJob(x))],
  if: '${{ ! failure() && ! cancelled() && always() }}',
  uses: './.github/workflows/examples.yaml',
  with: {
    skip: "${{ needs.calc.outputs.buildLanguages == 'false' }}",
  },
  secrets: 'inherit',
};

fs.writeFileSync(
  PIPELINE_FILE,
  '# This file is generated by pipeline.js\n' +
    yaml.dump(workflow, { quotingType: '"', noCompatMode: true })
);

try {
  cp.execSync(`git diff --exit-code --raw -p --stat ${PIPELINE_FILE}`, {
    stdio: 'inherit',
  });
} catch (error) {
  console.log('ci pipeline was not in sync, I updated it for you');
  process.exit(1);
}
