FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    rakudo \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="raku" DCC_REPL="raku" DCC_VERSION="raku --version" DCC_SELFTEST="cmFrdSAtZSAncHJpbnQgIkhlbGxvIFdvcmxkIVxuIic="
