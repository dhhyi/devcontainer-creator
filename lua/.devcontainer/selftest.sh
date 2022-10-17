#!/bin/sh

set -e
set -x
lua -v
luarocks --version
lua -e 'print("Hello World!")'
