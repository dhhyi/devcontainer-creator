Generate complex_extend fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Complex name, build, vscode settings, and tasks are present:

  $ jq -r '.name' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  Complex Extended
  $ jq -r '.build.dockerfile' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  Dockerfile
  $ jq '.customizations.vscode.settings | {foo, array}' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "foo": "bar",
    "array": [
      {
        "extensions": [
          "ts",
          "js"
        ],
        "path": "/usr/local/bin"
      },
      {
        "extensions": [
          "py"
        ],
        "path": "/usr/bin"
      }
    ]
  }
  $ jq '.tasks | map(.label)' "$CRAMTMP/out/.vscode/tasks.json"
  [
    "Say Hi"
  ]
