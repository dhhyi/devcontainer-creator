#!/bin/bash

cd "$(dirname "$0")"

if [ ! -z "$DCC_VERSION" ]
then
    export DCC_VERSION=`echo "$DCC_VERSION"`
fi

envsubst '$DCC_VERSION,$DCC_BINARY,$DCC_REPL' < disclaimer.sh > /disclaimer.sh
chmod +x /disclaimer.sh

envsubst '$DCC_VERSION,$DCC_BINARY,$DCC_REPL' < cont.sh > /usr/local/bin/cont
chmod +x /usr/local/bin/cont
