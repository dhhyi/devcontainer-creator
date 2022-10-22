#!/bin/bash

set -e

# Optional: Import test library
source dev-container-features-test-lib

sh /home/dcc/install-helpers.sh

check "templates after install" test -f /disclaimer.sh && test ! -f /usr/local/bin/cont

check "version referenced" grep -q "myversion" /disclaimer.sh

check "repl referenced" grep -q "myrepl" /disclaimer.sh

check "disclaimer executes" sh /disclaimer.sh

# Report result
reportResults
