#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check "templates after install" test -f /disclaimer.fish && test ! -f /usr/local/bin/cont

check "version referenced" grep -q "myversion" /disclaimer.fish

check "repl referenced" grep -q "myrepl" /disclaimer.fish

check "disclaimer executes" /disclaimer.fish

# Report result
reportResults
