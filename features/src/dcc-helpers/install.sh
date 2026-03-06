#!/bin/sh -e

packages=""

if ! command -v base64 > /dev/null; then
    packages="$packages coreutils"
fi

if ! command -v jq > /dev/null; then
    packages="$packages jq"
fi

if [ -n "$packages" ]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update

    # shellcheck disable=SC2086 # split by spaces
    apt-get -y install --no-install-recommends $packages

    apt-get clean && rm -rf /var/lib/apt/lists/*
fi

mkdir -p /home/dcc
cp disclaimer.fish install-helpers.sh /home/dcc
chmod +x /home/dcc/*.*sh

user="$(cat /etc/passwd | grep "1000:1000" | cut -d: -f1)"

if [ ! -z "${FISHERPLUGINS}" ]; then
    echo "$FISHERPLUGINS" | tr ',' '\n' | while read -r plugin; do
        echo "installing fisher plugin: $plugin"
        sudo -u "$user" fish -c "fisher install $plugin"
    done
fi

chsh -s "$(which fish)"
usermod -s "$(which fish)" "$user"
