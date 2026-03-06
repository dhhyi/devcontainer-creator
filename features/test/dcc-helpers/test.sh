#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check "disclaimer script" test -f /home/dcc/disclaimer.fish

check "install script" test -f /home/dcc/install-helpers.sh

check "base64 bin" command -v base64

check "jq bin" command -v jq

# Report result
reportResults
