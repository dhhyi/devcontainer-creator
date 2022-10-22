#!/bin/sh

(
set -x
$DCC_VERSION
)
echo
if [ ! -z "$DCC_REPL" ]
then
    echo "Use the command '$DCC_REPL' to start a REPL."
fi
if [ ! -z "$DCC_BINARY" ]
then
    echo "Use the command 'cont <script>' to continuously evaluate a given script."
fi

vscode="$1/.vscode/tasks.json"
if [ -f "$vscode" ]
then
    echo
    echo "Alternatively you can use the VSCode tasks:"
    cat "$vscode" | egrep -v '^\s*\/\/.*' | jq -r ".tasks [] .label" | while read label; do
        echo "- $label"
    done
fi
