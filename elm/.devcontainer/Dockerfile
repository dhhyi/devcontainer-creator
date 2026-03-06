FROM ghcr.io/dhhyi/dcc-devcontainer-node

USER ubuntu

RUN mise activate fish | source && npm i -g elm elm-test elm-format elm-review onchange

LABEL "org.opencontainers.image.description"="VSCode devcontainer for elm" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
