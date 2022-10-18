#!/bin/sh

set -e
set -x
erl +V
cat > /tmp/helloworld.erl <<EOF
-module(helloworld). -export([main/1]).
main(_) ->    io:format("Hello World!\n").
EOF
cd /tmp
rebar3 fmt -w helloworld.erl
cat helloworld.erl
escript helloworld.erl
