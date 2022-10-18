#!/bin/sh

(
    set -x
    gprolog --version
)
echo
echo "Use the command 'gprolog' to start a REPL."


vscode="$1/.vscode/tasks.json"
if [ -f "$vscode" ]
then
    echo
    echo "Alternatively you can use the VSCode tasks:"
    cat "$vscode" | egrep -v '^\s*\/\/.*' | jq -r ".tasks [] .label" | while read label; do
        echo "- $label"
    done
fi
