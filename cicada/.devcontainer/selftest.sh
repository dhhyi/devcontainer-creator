#!/bin/sh -ex
cic --version
cat >/tmp/helloworld.cic <<EOF
let greeting = "Hello, World!"
compute greeting
EOF
cic /tmp/helloworld.cic
