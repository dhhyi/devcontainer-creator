FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends ruby && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN gem install rubocop

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for ruby" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
