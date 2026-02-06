#!/usr/bin/env fish

$DCC_VERSION

echo
if [ -n "$DCC_REPL" ]
    echo "Use the command '$DCC_REPL' to start a REPL."
end
if [ -n "$DCC_BINARY" ]
    echo "Use the command 'cont <script>' to continuously evaluate a given script."
end

set vscode "$1/.vscode/tasks.json"
if [ -f "$vscode" ]
    echo
    echo "Alternatively you can use the VSCode tasks:"
    grep -vE '^\s*\/\/.*' "$vscode" | jq -r ".tasks [] .label" | while read -r label
        echo "- $label"
    end
end
