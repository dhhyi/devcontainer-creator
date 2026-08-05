Generate vscode-options fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Explicit extensions are emitted and hideFiles false disables files.exclude injection:

  $ jq '.customizations.vscode.extensions' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  [
    "ms-python.python",
    "golang.go"
  ]
  $ jq -r '.customizations.vscode.settings | has("files.exclude")' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  false
