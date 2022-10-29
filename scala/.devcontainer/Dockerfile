FROM ghcr.io/dhhyi/dcc-base-java:latest

ARG AMMONITE_VERSION

ADD https://github.com/com-lihaoyi/Ammonite/releases/download/${AMMONITE_VERSION} /usr/local/bin/amm
RUN sed -i '1 i\#!/usr/bin/env sh' /usr/local/bin/amm && chmod +rx /usr/local/bin/amm

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="amm" DCC_REPL="amm" DCC_VERSION="amm --version" DCC_SELFTEST="Y2F0ID4vdG1wL2hlbGxvd29ybGQuc2NhbGEgPDxFT0YKQG1haW4gZGVmIG1haW4oKSA9IHsKICAgIHByaW50bG4oIkhlbGxvIFdvcmxkISIpCn0KRU9GCmFtbSAvdG1wL2hlbGxvd29ybGQuc2NhbGEK"
