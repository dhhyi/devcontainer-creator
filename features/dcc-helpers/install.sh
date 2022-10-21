#!/bin/sh
set -e

mkdir -p /home/dcc

cp cont.sh disclaimer.sh install-helpers.sh /home/dcc

echo 'sudo -E sudo -E sh /home/dcc/install-helpers.sh && exec $0 "$@"' > /disclaimer.sh
