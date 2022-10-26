#!/bin/sh -ex
gprolog --version
gprolog --query-goal "write('Hello World!\n'),halt"
