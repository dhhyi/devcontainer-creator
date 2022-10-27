FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    perl exuberant-ctags \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN cpan Perl::Tidy

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="perl" DCC_REPL="" DCC_VERSION="perl --version"
