FROM ghcr.io/dhhyi/dcc-base-debian

ADD https://deno.land/x/install/install.sh /tmp/install.sh
RUN sh /tmp/install.sh && mv /root/.deno/bin/deno /usr/local/bin/deno

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for deno" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
