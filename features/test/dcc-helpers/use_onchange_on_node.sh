#!/bin/bash

set -e

# Optional: Import test library
source dev-container-features-test-lib

check "envsubst bin" command -v envsubst

check "no inotifywait bin" test -z "$(command -v inotifywait)"

check "onchange bin" command -v onchange

# Report result
reportResults
