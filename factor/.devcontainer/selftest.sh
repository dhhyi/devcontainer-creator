#!/bin/sh

set -e
set -x
cat >/tmp/helloworld.factor <<EOF
USE: io
"Hello World!" print
EOF
factor -run /tmp/helloworld.factor
