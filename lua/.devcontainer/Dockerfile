FROM ghcr.io/dhhyi/dcc-devcontainer-debian

USER root

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential cmake && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

RUN mise use -g lua
RUN luarocks install busted && luarocks install --server=https://luarocks.org/dev luaformatter && luarocks install luacheck

LABEL "org.opencontainers.image.description"="VSCode devcontainer for lua" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
