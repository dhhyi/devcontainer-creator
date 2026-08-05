Generate selftest_only fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Selftest command is encoded into container environment:

  $ jq -r '.containerEnv.DCC_SELFTEST' "$CRAMTMP/out/.devcontainer/devcontainer.json" | base64 -d
  bash -c "echo 'Hello World!'" (no-eol)
