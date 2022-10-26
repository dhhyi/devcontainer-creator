FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential libffi-dev libgmp-dev libgmp10 libncurses-dev libncurses5 libtinfo5 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode
ENV HOME=/home/vscode

RUN curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
ENV PATH="${HOME}/.ghcup/bin:${PATH}"
RUN ghcup install hls
RUN ghcup install stack

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="runhaskell" DCC_REPL="ghci" DCC_VERSION="ghcup --version;ghc --version"
