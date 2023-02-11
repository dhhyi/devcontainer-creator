FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential cmake ninja-build pkg-config && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://github.com/koka-lang/koka/releases/latest/download/install.sh /tmp/install.sh
RUN chmod +x /tmp/install.sh && /tmp/install.sh

USER vscode
