#!/bin/sh -ex
elm --version
cat >/tmp/helloworld.elm <<EOF
module HelloWorld exposing (..)
import Html exposing (text)
main = text "Hello World!"
EOF
cd /tmp
echo "Y" | elm init
elm make helloworld.elm
cat index.html | grep "Hello World!"
