Generate tmpfs fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

tmpfs run arguments are generated:

  $ jq '.runArgs' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  [
    "--tmpfs",
    "${containerWorkspaceFolder}/node_modules:exec",
    "--tmpfs",
    "/tmp:exec"
  ]
