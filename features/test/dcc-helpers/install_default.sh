#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

user="$(cat /etc/passwd | grep "1000:" | cut -d: -f1)"

check "fish default shell" grep -q "/home/$user:/usr/bin/fish" /etc/passwd

check "fish prompt" grep -q 'fish_prompt' "/home/$user/.config/fish/config.fish"

check "bash prompt" grep -q 'export PS1="$ "' "/home/$user/.bashrc"

check "templates after install" test -f /disclaimer.sh && test -f /usr/local/bin/cont

check "binary referenced" grep -q "bash" /usr/local/bin/cont

check "version referenced" grep -q "myversion" /disclaimer.sh

check "repl referenced" grep -q "myrepl" /disclaimer.sh

check "disclaimer executes" /disclaimer.sh

check "selftest exists" cat /selftest.sh

check "selftest success" /selftest.sh

check "selftest prints" sh -c '/selftest.sh | grep "selftest OK"'

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
