Generate simple_reference fixture:

  $ $DCC_EXEC "dcc://debian" "$CRAMTMP/out" > /dev/null

Protocol reference resolves debian image:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-devcontainer-debian
