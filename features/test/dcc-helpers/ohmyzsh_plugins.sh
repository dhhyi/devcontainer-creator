#!/bin/bash

set -e

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

grep 'plugins' "$HOME/.zshrc"

check "zsh plugins" grep -q 'plugins=(git debian)' "$HOME/.zshrc"

# Report result
reportResults
