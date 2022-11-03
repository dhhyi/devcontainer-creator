FROM ghcr.io/dhhyi/dcc-base-debian:latest

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
