#!/bin/sh

(
    set -x
    echo 'puts [info patchlevel]' | tclsh
)
echo
echo "Use the command 'tclsh' to start a REPL."
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
