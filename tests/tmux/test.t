Generate tmux fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

tmux profile and build instructions are present:

  $ jq -r '.build.dockerfile' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  Dockerfile
  $ jq '.customizations.vscode.settings | with_entries(select(.key | contains("terminal")))' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "chat.tools.terminal.terminalProfile.linux": {
      "path": "/usr/bin/bash"
    },
    "terminal.integrated.automationProfile.linux": {
      "path": "/usr/bin/bash"
    },
    "terminal.integrated.defaultProfile.linux": "tmux-reuse",
    "terminal.integrated.profiles.linux": {
      "tmux-reuse": {
        "args": [
          "new-session",
          "-A",
          "-s",
          "vscode"
        ],
        "icon": "terminal-tmux",
        "path": "/usr/bin/tmux"
      }
    }
  }

tmux is installed in the Dockerfile:

  $ grep -q 'install --no-install-recommends tmux' "$CRAMTMP/out/.devcontainer/Dockerfile"
