FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends openjdk-17-jdk && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode
ENV HOME=/home/vscode

RUN curl -s "https://get.sdkman.io" | bash
RUN bash -c ". $HOME/.sdkman/bin/sdkman-init.sh && sdk install groovy"

LABEL "org.opencontainers.image.description"="VSCode devcontainer for groovy" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
