#!/bin/sh -ex
moonc -v .
cat >/tmp/helloworld.moon <<EOF
print "Hello World!"
EOF
moon /tmp/helloworld.moon
