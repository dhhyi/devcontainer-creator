#!/bin/sh -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file>"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "File $1 does not exist"
    exit 1
fi

name=$(basename "$1" .idr)
dir=$(dirname "$1")
cd "$dir"

idris2 "$1" --build-dir /tmp/idris --output-dir /tmp/idris -o $name
/tmp/idris/$name "$@"
