#!/bin/bash

set -e
set -o pipefail

rm -Rf dist/test || true

npm ci
npm run build

npm i --no-save @devcontainers/cli

for yaml in examples/*.yaml
do
    lang=$(basename $yaml .yaml)

    echo "#############################################"
    echo "# Testing $lang"
    echo "#############################################"

    node dist/bundle.js dcc://$lang dist/test/$lang --full

    echo "building devcontainer"
    output=`npx devcontainer build --workspace-folder dist/test/$lang --image-name devcontainer-$lang 2>&1` || (echo $output && exit 1)

    docker run --rm devcontainer-$lang sh /selftest.sh
done
