Generate build-options fixture:

  $ $DCC_EXEC "$TESTDIR/language.yaml" "$CRAMTMP/out" > /dev/null

Build args are mapped into devcontainer build config:

  $ jq '.build.args' "$CRAMTMP/out/.devcontainer/devcontainer.json"
  {
    "APP_VERSION": "22",
    "TOOL_VER": 7
  }

Prepare, package, root and user build sections are rendered in Dockerfile:

  $ sed -n '/^USER root$/,/^RUN echo user-home-\$HOME_SETUP$/p' "$CRAMTMP/out/.devcontainer/Dockerfile" | sed '/^$/d'
  USER root
  ARG APP_VERSION
  ARG APP_VERSION
  RUN echo preparing-$APP_VERSION
  RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends ripgrep fd-find && apt-get clean && rm -rf /var/lib/apt/lists/*
  ARG TOOL_VER
  ARG TOOL_VER
  RUN echo root-$TOOL_VER
  USER vscode
  ENV HOME=/home/vscode
  ARG HOME_SETUP
  RUN echo user-home-$HOME_SETUP
