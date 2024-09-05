#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check 'vscode preset' grep 'vscode' "$HOME/.config/lazygit/config.yml"

# Report result
reportResults
