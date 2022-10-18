#!/bin/bash

set -e
set -o pipefail

rm -Rf dist/test || true

npm exec pnpm -- i --prod --ignore-scripts
npm exec pnpm run build

for yaml in examples/*.yaml
do
    lang=$(basename $yaml .yaml)

    echo "#############################################"
    echo "# Testing $lang"
    echo "#############################################"

    if [ "$1" = "local" ]
    then
        spec=$yaml
    else
        spec=dcc://$lang
    fi

    node dist/bundle.js $spec dist/test/$lang --full --name "Example devcontainer for $lang" --tag devcontainer-$lang --test
done
