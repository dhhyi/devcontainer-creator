FROM ghcr.io/dhhyi/dcc-devcontainer-lua

USER vscode

RUN luarocks install https://luarocks.org/manifests/leafo/moonscript-dev-1.rockspec && luarocks install moonpick

LABEL "org.opencontainers.image.description"="VSCode devcontainer for moonscript" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
