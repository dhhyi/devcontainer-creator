Generate extra_properties fixture with validation disabled (--no-validate):

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" --no-validate > /dev/null

Unknown top-level properties are ignored and no-validate flag is kept in update script:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-devcontainer-javascript
  $ jq -r 'has("prettier")' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  false
  $ grep -o -- '--no-validate' "$CRAMTMP/out/.update_devcontainer.sh"
  --no-validate
