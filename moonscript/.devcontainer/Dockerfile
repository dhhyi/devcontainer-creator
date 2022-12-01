FROM ghcr.io/dhhyi/dcc-devcontainer-lua

USER root

RUN luarocks install https://luarocks.org/manifests/leafo/moonscript-dev-1.rockspec
RUN luarocks install moonpick

USER vscode
