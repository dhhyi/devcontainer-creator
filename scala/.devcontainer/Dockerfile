FROM mcr.microsoft.com/vscode/devcontainers/java@sha256:63f7d975e52099bc63cf63383be9443577337c3c3d09d79b405c2ca266c9e470

ARG AMMONITE_VERSION

ADD https://github.com/com-lihaoyi/Ammonite/releases/download/${AMMONITE_VERSION} /usr/local/bin/amm
RUN sed -i '1 i\#!/usr/bin/env sh' /usr/local/bin/amm && chmod +rx /usr/local/bin/amm

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="amm" DCC_REPL="amm" DCC_VERSION="amm --version"
