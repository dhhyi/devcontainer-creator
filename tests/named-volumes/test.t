Generate named-volumes fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Named volumes and ownership command are configured:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-devcontainer-debian
  $ jq '{mounts, postCreateCommand}' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "mounts": [
      "type=volume,target=${containerWorkspaceFolder}/build,source=dcc-test-build-cache",
      "type=volume,target=/home/vscode/.cache/tool,source=dcc-test-tool-cache",
      "type=volume,target=/opt/tool/cache,source=dcc-test-opt-tool-cache"
    ],
    "postCreateCommand": "sudo install -d -o vscode -g vscode build /home/vscode /home/vscode/.cache /home/vscode/.cache/tool /opt /opt/tool /opt/tool/cache"
  }
