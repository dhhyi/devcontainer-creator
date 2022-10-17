#!/bin/sh

(
    set -x
    elm --version
)
echo
echo "Use the command 'elm repl' to start a REPL."


vscode=$(dirname $(dirname $0))/.vscode/tasks.json
if [ -f "$vscode" ]
echo
echo "Alternatively you can use the VSCode tasks:"
then
    cat $vscode | egrep -v '^\s*\/\/.*' | jq -r ".tasks [] .label" | while read label; do
        echo "- $label"
    done
fi
