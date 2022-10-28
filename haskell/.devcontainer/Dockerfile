FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential libffi-dev libgmp-dev libgmp10 libncurses-dev libncurses5 libtinfo5 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode
ENV HOME=/home/vscode

RUN curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
ENV PATH="${HOME}/.ghcup/bin:${PATH}"
RUN ghcup install hls
RUN ghcup install stack

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="runhaskell" DCC_REPL="ghci" DCC_VERSION="ghcup --version; ghc --version" DCC_SELFTEST="Y2F0ID4gL3RtcC9oZWxsb3dvcmxkLmhzIDw8RU9GCm1haW4gPSBwdXRTdHJMbiAiSGVsbG8gV29ybGQhIgpFT0YKcnVuaGFza2VsbCAvdG1wL2hlbGxvd29ybGQuaHMK"
