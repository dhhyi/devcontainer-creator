FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends erlang && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://s3.amazonaws.com/rebar3/rebar3 /usr/local/bin/rebar3
RUN chmod +rx /usr/local/bin/rebar3

USER vscode
ENV HOME=/home/vscode

RUN mkdir -p "${HOME}/.config/rebar3" && echo "e3BsdWdpbnMsIFtlcmxmbXRdfS4Ke2VybGZtdCwgW3dyaXRlXX0uCg==" | base64 -d > "${HOME}/.config/rebar3/rebar.config" && chmod +r "${HOME}/.config/rebar3/rebar.config"

LABEL "org.opencontainers.image.description"="VSCode devcontainer for erlang" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
