#!/bin/sh

cd "$(dirname "$(readlink -f "$0")")"

curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - dcc://ruby . --full --name "Example devcontainer for ruby" "$@"
