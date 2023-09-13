const cp = require('child_process');
const fs = require('fs');

const name = process.argv[2];

if (!name) {
  console.error('Please provide the base image name');
  process.exit(1);
} else if (!fs.existsSync(`base-images/${name}`)) {
  console.error(`Base image ${name} does not exist`);
  process.exit(1);
}

function currentBuildXDriver() {
  const driverRegex = /^Driver:\s+(.*)$/;
  const buildXInspect = cp.execSync('docker buildx inspect', {
    encoding: 'utf-8',
  });
  const driver = buildXInspect.match(driverRegex)?.[1];
  return driver;
}

if (currentBuildXDriver() !== 'docker-container') {
  cp.execSync('docker buildx create --use', { stdio: 'inherit' });
}

const tag = `ghcr.io/dhhyi/dcc-base-${name}`;
const cacheTag = `${tag}-cache`;

cp.execSync(
  [
    'devcontainer build',
    `--workspace-folder base-images/${name}`,
    `--cache-to type=registry,mode=max,ref=${cacheTag}`,
    `--cache-from type=registry,ref=${cacheTag}`,
    `--image-name ${tag}`,
  ].join(' '),
  { stdio: 'inherit' }
);
