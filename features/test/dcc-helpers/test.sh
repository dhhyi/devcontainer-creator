#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check "disclaimer template" test -f /home/dcc/disclaimer.sh

check "cont template" test -f /home/dcc/cont.sh

check "install script" test -f /home/dcc/install-helpers.sh

check "envsubst bin" command -v envsubst

check "inotifywait bin" command -v inotifywait

check "base64 bin" command -v base64

# Report result
reportResults
