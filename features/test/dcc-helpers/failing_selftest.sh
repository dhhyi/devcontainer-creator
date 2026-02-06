#!/bin/bash

# shellcheck disable=SC1091 # Import test library
source dev-container-features-test-lib

check "disclaimer executes" /disclaimer.fish

check "selftest exists" cat /selftest.sh

/selftest.sh
check "selftest fail" test $? -eq '3'

check "selftest prints" sh -c '/selftest.sh | grep "selftest FAIL"'

# Report result
reportResults
