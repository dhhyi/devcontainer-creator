Generate simple_reference fixture:

  $ $DCC_EXEC "dcc://javascript" "$CRAMTMP/out" > /dev/null

Protocol reference resolves javascript image:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-devcontainer-javascript
