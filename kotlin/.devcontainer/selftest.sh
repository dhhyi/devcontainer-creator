#!/bin/sh -ex
cat >/tmp/helloworld.kt <<EOF
fun main() {
  println("Hello World!")
}
EOF
kotlinc-native /tmp/helloworld.kt -o /tmp/helloworld
/tmp/helloworld.kexe
