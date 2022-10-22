#!/bin/bash

set -e

# Optional: Import test library
source dev-container-features-test-lib

check "templates after install" test -f /disclaimer.sh && test -f /usr/local/bin/cont

check "binary referenced" grep -q "bash" /usr/local/bin/cont

check "version referenced" grep -q "myversion" /disclaimer.sh

check "repl referenced" grep -q "myrepl" /disclaimer.sh

check "disclaimer executes" sh /disclaimer.sh

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
