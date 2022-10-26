FROM mcr.microsoft.com/vscode/devcontainers/base@sha256:3b7d8bb13c1d9eadffa1c1b8cfcf0288b71355771f02ab8dbe055d29023b6091

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    tcl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="tclsh" DCC_REPL="tclsh" DCC_VERSION="echo 'puts [info patchlevel]' | tclsh"
