Generate empty fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Defaults are applied:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-base-debian
  $ jq -r '.customizations.vscode.settings["files.exclude"][".vscode"]' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  true
