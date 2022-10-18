#!/bin/bash

set -e
set -o pipefail

for yaml in examples/*.yaml
do
    lang=$(basename $yaml .yaml)

    echo "#############################################"
    echo "# Publishing $lang"
    echo "#############################################"

    echo "FROM devcontainer-$lang" | docker build --label org.opencontainers.image.source="https://github.com/dhhyi/devcontainer-creator" --label org.opencontainers.image.description="VSCode devcontainer for $lang" -t ghcr.io/dhhyi/dcc-devcontainer-$lang:latest -

    docker push ghcr.io/dhhyi/dcc-devcontainer-$lang:latest
done
