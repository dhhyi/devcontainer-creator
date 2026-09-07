#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

user="vscode"
fish_path="$(command -v fish)"

check "fish default shell" grep -q "/home/$user:$fish_path" /etc/passwd

check "fish default shell for root" grep -q "/root:$fish_path" /etc/passwd

check "fish prompt" grep -q 'fish_prompt' "/home/$user/.config/fish/config.fish"

check "bash prompt" grep -q 'export PS1="$ "' "/home/$user/.bashrc"

check "templates after install" test -f /home/dcc/disclaimer.fish

check "disclaimer executes" /home/dcc/disclaimer.fish

check "selftest exists" cat /selftest.sh

check "selftest success" /selftest.sh

check "selftest prints" sh -c '/selftest.sh | grep "selftest OK"'

# Report result
reportResults
