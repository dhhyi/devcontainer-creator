const cp = require('child_process');

const name = process.argv[2];

if (!name) {
  console.error('Please provide the base image name');
  process.exit(1);
}

cp.execSync(
  `devcontainer build --workspace-folder base-images/${name} --cache-from ghcr.io/dhhyi/dcc-base-${name} --image-name ghcr.io/dhhyi/dcc-base-${name}`,
  { stdio: 'inherit' }
);
