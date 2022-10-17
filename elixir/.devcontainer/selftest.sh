#!/bin/sh

set -e
set -x
elixir --version
elixir -e 'IO.puts "Hello World!"'
