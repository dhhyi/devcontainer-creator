#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check "envsubst bin" command -v envsubst

check "no inotifywait bin" test -z "$(command -v inotifywait)"

check "onchange bin" command -v onchange

check "disclaimer executes" /disclaimer.sh

echo "echo 'mycommand'" > /tmp/file.sh
cont /tmp/file.sh > /tmp/file.out &
sleep 1
touch /tmp/file.sh
sleep 1
touch /tmp/file.sh
sleep 1
check "file executed 3 times" test "$(grep -c -e "^mycommand" /tmp/file.out)" = "3"

# Report result
reportResults
