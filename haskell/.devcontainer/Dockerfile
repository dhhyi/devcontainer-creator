FROM ghcr.io/dhhyi/dcc-base-debian-old

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends haskell-platform hlint && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode
