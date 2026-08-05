FROM ghcr.io/dhhyi/dcc-devcontainer-java

USER root

ARG AMMONITE_VERSION

ADD https://github.com/com-lihaoyi/Ammonite/releases/download/${AMMONITE_VERSION} /usr/local/bin/amm
RUN sed -i '1 i\#!/usr/bin/env sh' /usr/local/bin/amm && chmod +rx /usr/local/bin/amm

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for scala" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
