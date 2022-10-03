#!/bin/bash

set -e
set -o pipefail

npm ci
npm run build

npm i --no-save @devcontainers/cli

for lang in examples/*.yaml
do
    rm -Rf dist/test || true

    echo "#############################################"
    echo "# Testing $lang"
    echo "#############################################"

    node dist/bundle.js $lang dist/test

    npx devcontainer build --workspace-folder dist/test --image-name img

    docker run --rm img sh /selftest.sh
done
