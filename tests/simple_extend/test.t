Generate simple_extend fixture:

  $ mkdir -p "$CRAMTMP/case"
  $ cp "$TESTDIR/language.yaml" "$CRAMTMP/case/language.yaml"
  $ cd "$CRAMTMP/case"
  $ $DCC_EXEC language.yaml . > /dev/null

Generated devcontainer.json matches expected shape:

  $ cat .devcontainer/devcontainer.json
  {
    "$schema": "https://raw.githubusercontent.com/devcontainers/spec/refs/heads/main/schemas/devContainer.schema.json",
    "name": "Simple Extended",
    "runArgs": [
      "--name",
      "simple-extended-${devcontainerId}"
    ],
    "image": "ghcr.io/dhhyi/dcc-devcontainer-javascript",
    "customizations": {
      "vscode": {
        "settings": {
          "files.exclude": {
            ".devcontainer": true,
            ".update_devcontainer.sh": true,
            ".vscode": true
          },
          "foo": "bar"
        }
      }
    },
    "containerEnv": {
      "DCC_SELFTEST": "bm9kZSAtZSAnY29uc29sZS5sb2coIkhlbGxvIEV4dGVuZGVkISIpOyc="
    }
  }

Generated VS Code task looks right:

  $ cat .vscode/tasks.json
  {
    "version": "2.0.0",
    "tasks": [
      {
        "command": "node -e 'console.log(\"Hi!\");'",
        "label": "Say Hi",
        "problemMatcher": [],
        "type": "shell"
      }
    ]
  }

Generated update script looks right:

  $ sed '/^$/d' .update_devcontainer.sh
  #!/bin/sh -e
  cd "$(dirname "$(readlink -f "$0")")"
  curl -so- https://raw.githubusercontent.com/dhhyi/devcontainer-creator/dist/bundle.js | node - language.yaml . "$@"
