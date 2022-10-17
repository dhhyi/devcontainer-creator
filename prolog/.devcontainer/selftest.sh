#!/bin/sh

set -e
set -x
gprolog --version
gprolog --query-goal "write('Hello World!\n'),halt"
