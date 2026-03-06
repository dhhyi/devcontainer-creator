#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

user="$(cat /etc/passwd | grep "1000:" | cut -d: -f1)"

check "fish default shell" grep -q "/home/$user:/usr/bin/fish" /etc/passwd

check "fish default shell for root" grep -q "/root:/usr/bin/fish" /etc/passwd

check "fish prompt" grep -q 'fish_prompt' "/home/$user/.config/fish/config.fish"

check "bash prompt" grep -q 'export PS1="$ "' "/home/$user/.bashrc"

check "templates after install" test -f /home/dcc/disclaimer.fish

check "disclaimer executes" /home/dcc/disclaimer.fish

check "selftest exists" cat /selftest.sh

check "selftest success" /selftest.sh

check "selftest prints" sh -c '/selftest.sh | grep "selftest OK"'

# Report result
reportResults
