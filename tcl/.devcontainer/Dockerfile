FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    tcl inotify-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="tclsh" DCC_REPL="tclsh" DCC_VERSION="echo 'puts [info patchlevel]' | tclsh"
