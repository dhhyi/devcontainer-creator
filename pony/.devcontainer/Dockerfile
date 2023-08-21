FROM ghcr.io/dhhyi/dcc-base-ubuntu

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential clang && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

ENV SHELL=/bin/bash PATH=/home/vscode/.local/share/ponyup/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf -o /tmp/ponyup-init.sh https://raw.githubusercontent.com/ponylang/ponyup/latest-release/ponyup-init.sh && sh /tmp/ponyup-init.sh
RUN ponyup update ponyc release

LABEL "org.opencontainers.image.description"="VSCode devcontainer for pony" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
