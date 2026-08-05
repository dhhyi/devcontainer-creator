Generate named-volumes fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Named volumes and ownership command are configured:

  $ jq -r '.image' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  ghcr.io/dhhyi/dcc-devcontainer-javascript-pnpm
  $ jq '{mounts, postCreateCommand}' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "mounts": [
      "type=volume,target=${containerWorkspaceFolder}/node_modules,source=dcc-test-node-modules",
      "type=volume,target=/home/ubuntu/.cache/pnpm,source=dcc-test-pnpm-cache"
    ],
    "postCreateCommand": "sudo mkdir -p node_modules /home/ubuntu/.cache/pnpm && sudo chown -Rf ubuntu node_modules && sudo chown -Rf ubuntu /home/ubuntu"
  }
