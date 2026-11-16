Generate LazyGit history fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

LazyGit history and other named volumes coexist:

  $ jq '.mounts' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  [
    "type=volume,target=/home/vscode/.local/state/lazygit,source=lazygit-history-${devcontainerId}",
    "type=volume,target=${containerWorkspaceFolder}/build,source=dcc-test-build-cache"
  ]

Generate Ubuntu LazyGit history fixture:

  $ $DCC_EXEC "$TESTDIR/ubuntu.yaml" "$CRAMTMP/ubuntu" > /dev/null

The history mount uses Ubuntu's remote user and normalized configured name:

  $ jq '.mounts' "$CRAMTMP/ubuntu/.devcontainer/devcontainer.json"
  [
    "type=volume,target=/home/ubuntu/.local/state/lazygit,source=lazygit-history-my-project"
  ]

The container name retains its unique ID:

  $ jq '.runArgs' "$CRAMTMP/ubuntu/.devcontainer/devcontainer.json"
  [
    "--name",
    "my-project-${devcontainerId}"
  ]

The same configured name shares history across workspace paths:

  $ $DCC_EXEC "$TESTDIR/ubuntu.yaml" "$CRAMTMP/another-workspace" > /dev/null
  $ jq '.mounts' "$CRAMTMP/ubuntu/.devcontainer/devcontainer.json" > "$CRAMTMP/first-mounts.json"
  $ jq '.mounts' "$CRAMTMP/another-workspace/.devcontainer/devcontainer.json" > "$CRAMTMP/second-mounts.json"
  $ diff "$CRAMTMP/first-mounts.json" "$CRAMTMP/second-mounts.json"

A command-line name overrides the configured history name:

  $ $DCC_EXEC "$TESTDIR/ubuntu.yaml" "$CRAMTMP/override" --name 'OtherProject!' > /dev/null
  $ jq -r '.mounts[0]' "$CRAMTMP/override/.devcontainer/devcontainer.json"
  type=volume,target=/home/ubuntu/.local/state/lazygit,source=lazygit-history-other-project

A name without usable characters falls back to the unique ID:

  $ $DCC_EXEC "$TESTDIR/ubuntu.yaml" "$CRAMTMP/fallback" --name '!!!' > /dev/null
  $ jq -r '.mounts[0]' "$CRAMTMP/fallback/.devcontainer/devcontainer.json"
  type=volume,target=/home/ubuntu/.local/state/lazygit,source=lazygit-history-${devcontainerId}
