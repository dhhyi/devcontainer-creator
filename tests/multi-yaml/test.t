Generate multi-yaml fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Document marked as DCC spec is selected:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-base-ubuntu
