FROM ghcr.io/dhhyi/dcc-base-debian

RUN wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/dart.gpg && echo 'deb [signed-by=/usr/share/keyrings/dart.gpg arch=amd64] https://storage.googleapis.com/download.dartlang.org/linux/debian stable main' | tee /etc/apt/sources.list.d/dart_stable.list

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends dart && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

RUN echo "dart --disable-analytics" | tee -a ~/.zshrc ~/.bashrc

LABEL "org.opencontainers.image.description"="VSCode devcontainer for dart" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
