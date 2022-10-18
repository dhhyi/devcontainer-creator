#!/bin/sh

(
    set -x
    ts-node -vvv
)
echo
echo "Use the command 'ts-node' to start a REPL."
echo "Use the command 'cont <script>' to continuously evaluate a given script."


vscode="$1/.vscode/tasks.json"
if [ -f "$vscode" ]
then
    echo
    echo "Alternatively you can use the VSCode tasks:"
    cat "$vscode" | egrep -v '^\s*\/\/.*' | jq -r ".tasks [] .label" | while read label; do
        echo "- $label"
    done
fi
