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

    echo "building devcontainer"
    output=`npx devcontainer build --workspace-folder dist/test --image-name img 2>&1` || (echo $output && exit 1)

    docker run --rm img sh /selftest.sh
done
