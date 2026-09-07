Generate named-volumes fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Named volumes and ownership command are configured:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-devcontainer-debian
  $ jq '{mounts, postCreateCommand}' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "mounts": [
      "type=volume,target=${containerWorkspaceFolder}/build,source=dcc-test-build-cache",
      "type=volume,target=/home/vscode/.cache/tool,source=dcc-test-tool-cache"
    ],
    "postCreateCommand": "sudo install -d -o vscode -g vscode build /home/vscode/.cache/tool"
  }
