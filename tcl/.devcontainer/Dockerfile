FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    tcl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="tclsh" DCC_REPL="tclsh" DCC_VERSION="echo 'puts [info patchlevel]' | tclsh" DCC_SELFTEST="ZWNobyAncHV0cyAiSGVsbG8gV29ybGQhIicgfCB0Y2xzaA=="
