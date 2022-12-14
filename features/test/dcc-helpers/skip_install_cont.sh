#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check "templates after install" test -f /disclaimer.sh && test ! -f /usr/local/bin/cont

check "version referenced" grep -q "myversion" /disclaimer.sh

check "repl referenced" grep -q "myrepl" /disclaimer.sh

check "disclaimer executes" /disclaimer.sh

# Report result
reportResults
