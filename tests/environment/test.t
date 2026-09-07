Generate environment fixture:

  $ cp "$TESTDIR/language.yaml" "$CRAMTMP/language.yaml"
  $ $DCC_EXEC "$CRAMTMP/language.yaml" "$CRAMTMP/out" > /dev/null

Generated devcontainer.json contains APP_ENV in containerEnv:

  $ jq -r '.containerEnv.APP_ENV' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  development
