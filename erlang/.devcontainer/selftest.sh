#!/bin/sh

set -e
set -x
erl +V
cat > /tmp/helloworld.erl <<EOF
-module(helloworld).
-export([main/1]).
main(_) -> io:format("Hello World!\n").
EOF
rebar3 format --files /tmp/helloworld.erl
escript /tmp/helloworld.erl
