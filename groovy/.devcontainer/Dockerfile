FROM ghcr.io/dhhyi/dcc-base-java

USER vscode

RUN bash -c ". $SDKMAN_DIR/bin/sdkman-init.sh && sdk install groovy"

LABEL "org.opencontainers.image.description"="VSCode devcontainer for groovy" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
