#!/bin/sh

set -e
set -x
clojure --version
clojure -M -e '(println "Hello World!")'
