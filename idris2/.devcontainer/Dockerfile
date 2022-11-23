FROM ghcr.io/dhhyi/dcc-base-debian:latest

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    chezscheme build-essential libgmp-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG IDRIS2_VERSION

RUN git clone --depth 1 --branch v${IDRIS2_VERSION} https://github.com/idris-lang/Idris2.git /tmp/idris2
RUN cd /tmp/idris2 && sed -i 's%PREFIX.*%PREFIX ?= /usr/local%' config.mk && make bootstrap SCHEME=chezscheme && make install
COPY runidris.sh /usr/local/bin/runidris
RUN chmod +x  /usr/local/bin/runidris

USER vscode
