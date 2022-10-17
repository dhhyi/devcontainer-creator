#!/bin/sh

set -e
set -x
amm --version
cat >/tmp/helloworld.scala <<EOF
@main def main() = {
    println("Hello World!")
}
EOF
amm /tmp/helloworld.scala
