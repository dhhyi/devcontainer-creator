#!/bin/sh

set -e
set -x
cat >/tmp/helloworld.kt <<EOF
fun main() {
  println("Hello World!")
}
EOF
kotlinc-native /tmp/helloworld.kt -o /tmp/helloworld
/tmp/helloworld.kexe
