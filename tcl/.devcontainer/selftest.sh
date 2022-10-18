#!/bin/sh

set -e
set -x
echo 'puts [info patchlevel]' | tclsh
echo 'puts "Hello World!"' | tclsh
