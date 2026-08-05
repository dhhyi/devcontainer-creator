Generate https_reference fixture:

  $ $DCC_EXEC "https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/tests/simple_extend/language.yaml" "$CRAMTMP/out" > /dev/null

Remote reference resolves expected values:

  $ jq -r '.name' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  Simple Extended
  $ jq -r '.customizations.vscode.settings.foo' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  bar
