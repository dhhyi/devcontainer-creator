Generate initialize fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

instantiate and initialize commands are flattened:

  $ jq -r '.postCreateCommand' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  echo 'Creating World' && echo barfoo && echo "blubb"
  $ jq -r '.postStartCommand' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  echo 'Hello World' && echo foobar && echo "blubb"
