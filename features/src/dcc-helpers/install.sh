#!/bin/sh
set -e

packages=""

if ! command -v envsubst > /dev/null; then
    packages="$packages gettext-base"
fi

if command -v npm > /dev/null; then
    npm i -g onchange
elif ! command -v inotifywait > /dev/null; then
    packages="$packages inotify-tools"
fi

if [ -n "$packages" ]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update

    apt-get -y install --no-install-recommends $packages

    apt-get clean && rm -rf /var/lib/apt/lists/*
fi

mkdir -p /home/dcc

cp cont.sh disclaimer.sh install-helpers.sh /home/dcc

echo 'sudo -E sudo -E sh /home/dcc/install-helpers.sh && exec $0 "$@"' > /disclaimer.sh
