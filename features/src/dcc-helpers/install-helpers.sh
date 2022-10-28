#!/bin/sh -e

cd "$(dirname "$0")"

# shellcheck disable=SC2016 # no expand
envsubst '$DCC_VERSION,$DCC_BINARY,$DCC_REPL' < disclaimer.sh > /disclaimer.sh
chmod +x /disclaimer.sh

if [ -n "$DCC_BINARY" ]; then
    # shellcheck disable=SC2016 # no expand
    envsubst '$DCC_VERSION,$DCC_BINARY,$DCC_REPL' < cont.sh > /usr/local/bin/cont
    chmod +x /usr/local/bin/cont
fi

cat > /selftest.sh << EOF
#!/bin/sh -ex

$DCC_VERSION

EOF
if [ -n "$DCC_SELFTEST" ]; then
    echo "$DCC_SELFTEST" | base64 -d >> /selftest.sh
fi
chmod +x /selftest.sh
