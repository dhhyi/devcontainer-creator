FROM ubuntu:noble-20260113

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
        sudo curl git ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

USER ubuntu

RUN curl https://mise.run | sh

RUN mkdir -p ~/.config/fish/conf.d \
    && echo 'mise activate fish | source' > ~/.config/fish/conf.d/mise.fish \
    && echo 'fish_add_path "$HOME/.local/bin"' > ~/.config/fish/conf.d/local-bin.fish

USER root
