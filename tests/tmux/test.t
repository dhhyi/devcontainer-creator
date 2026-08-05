Generate tmux fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

tmux profile and build instructions are present:

  $ jq -r '.build.dockerfile' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  Dockerfile
  $ jq '.customizations.vscode.settings | {"terminal.integrated.defaultProfile.linux": ."terminal.integrated.defaultProfile.linux", "chat.tools.terminal.terminalProfile.linux": ."chat.tools.terminal.terminalProfile.linux"}' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "terminal.integrated.defaultProfile.linux": "tmux-reuse",
    "chat.tools.terminal.terminalProfile.linux": {
      "path": "/usr/bin/bash"
    }
  }

tmux is installed in the Dockerfile:

  $ grep -q 'install --no-install-recommends tmux' "$CRAMTMP/out/.devcontainer/Dockerfile"
