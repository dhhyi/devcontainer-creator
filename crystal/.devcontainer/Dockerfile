FROM ghcr.io/dhhyi/dcc-base-debian

RUN echo 'deb http://download.opensuse.org/repositories/devel:/languages:/crystal/Debian_11/ /' | sudo tee /etc/apt/sources.list.d/devel:languages:crystal.list && curl -fsSL https://download.opensuse.org/repositories/devel:languages:crystal/Debian_11/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/devel_languages_crystal.gpg > /dev/null

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends crystal libssl-dev libxml2-dev libyaml-dev libgmp-dev libz-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for crystal" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
