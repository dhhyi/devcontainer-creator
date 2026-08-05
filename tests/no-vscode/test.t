Generate fixture with --no-vscode:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" --no-vscode > /dev/null

.vscode tasks are not created and hideFiles excludes it:

  $ test ! -f "$CRAMTMP/out/.vscode/tasks.json"
  $ jq -r '.customizations.vscode.settings["files.exclude"] | has(".vscode")' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  false

Update script keeps --no-vscode option:

  $ grep -o -- '--no-vscode' "$CRAMTMP/out/.update_devcontainer.sh"
  --no-vscode
