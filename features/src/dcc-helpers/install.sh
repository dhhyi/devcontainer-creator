#!/bin/sh -e

packages=""

if ! command -v envsubst > /dev/null; then
    packages="$packages gettext-base"
fi

if ! command -v base64 > /dev/null; then
    packages="$packages coreutils"
fi

if ! command -v jq > /dev/null; then
    packages="$packages jq"
fi

if command -v npm > /dev/null; then
    npm i -g onchange
elif ! command -v inotifywait > /dev/null; then
    packages="$packages inotify-tools"
fi

if [ -n "$packages" ]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update

    # shellcheck disable=SC2086 # split by spaces
    apt-get -y install --no-install-recommends $packages

    apt-get clean && rm -rf /var/lib/apt/lists/*
fi

mkdir -p /home/dcc
cp cont.sh disclaimer.sh install-helpers.sh /home/dcc
chmod +x /home/dcc/*.sh

# shellcheck disable=SC2016 # no expand
echo 'sudo -E /home/dcc/install-helpers.sh && exec $0 "$@"' > /disclaimer.sh
