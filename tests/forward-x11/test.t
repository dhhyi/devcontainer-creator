Generate forward-x11 fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

X11 run arguments are configured:

  $ jq '.runArgs' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  [
    "--net",
    "host",
    "-e",
    "DISPLAY=:0",
    "-v",
    "/tmp/.X11-unix:/tmp/.X11-unix"
  ]
