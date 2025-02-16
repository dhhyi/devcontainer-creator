#!/bin/sh -e

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/examples/crystal.yaml . --name "Example devcontainer for crystal" "$@"
