#!/bin/sh -ex
amm --version
cat >/tmp/helloworld.scala <<EOF
@main def main() = {
    println("Hello World!")
}
EOF
amm /tmp/helloworld.scala
