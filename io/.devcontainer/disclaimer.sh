#!/bin/sh

(
    set -x
    io --version
)
echo
echo "Use the command 'io' to start a REPL."
echo "Use the command 'cont <script>' to continuously evaluate a given script."


vscode=$(dirname $(dirname $0))/.vscode/tasks.json
if [ -f "$vscode" ]
echo
echo "Alternatively you can use the VSCode tasks:"
then
    cat $vscode | egrep -v '^\s*\/\/.*' | jq -r ".tasks [] .label" | while read label; do
        echo "- $label"
    done
fi
