#!/bin/sh
set -e

mkdir -p /home/dcc

CONT=${CONT:-true}

if [ "${CONT}" = "true" ]
then
    cp cont.sh /home/dcc
fi
cp disclaimer.sh install-helpers.sh /home/dcc

echo 'sudo -E sudo -E sh /home/dcc/install-helpers.sh && exec $0 "$@"' > /disclaimer.sh
