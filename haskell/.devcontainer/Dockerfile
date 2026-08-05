FROM ghcr.io/dhhyi/dcc-devcontainer-debian

USER root

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends ghc hlint && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for haskell" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
