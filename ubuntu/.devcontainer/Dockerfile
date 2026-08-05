FROM ghcr.io/dhhyi/dcc-base-ubuntu

RUN mkdir -p "/etc/fish/conf.d" && echo "aWYgdHlwZSAtcSBtaXNlCiAgbWlzZSBhY3RpdmF0ZSBmaXNoIHwgc291cmNlCmVuZAo=" | base64 -d > "/etc/fish/conf.d/mise.fish" && chmod +r "/etc/fish/conf.d/mise.fish"

SHELL ["/usr/bin/env", "fish", "-c"]

USER ubuntu
ENV HOME=/home/ubuntu

RUN mkdir -p "$HOME/.config/fish/conf.d" && echo "aWYgdHlwZSAtcSBtaXNlCiAgbWlzZSBhY3RpdmF0ZSBmaXNoIHwgc291cmNlCmVuZAo=" | base64 -d > "$HOME/.config/fish/conf.d/mise.fish" && chmod +r "$HOME/.config/fish/conf.d/mise.fish"

LABEL "org.opencontainers.image.description"="VSCode devcontainer for ubuntu" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
