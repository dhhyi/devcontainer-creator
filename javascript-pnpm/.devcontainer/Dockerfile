FROM ghcr.io/dhhyi/dcc-devcontainer-javascript

USER root

RUN mkdir -p "/tmp" && echo "IyEvYmluL2Jhc2gKaWYgISBtb3VudCB8IGdyZXAgLXEgJEhPTUUvLmNhY2hlL3BucG07IHRoZW4KICBlY2hvIC1lICJcZVszMW1XQVJOSU5HOiBpdCBpcyByZWNvbW1lbmRlZCB0byBtb3VudCAkSE9NRS8uY2FjaGUvcG5wbSBhcyBhIG5hbWVkIHZvbHVtZVxlWzBtIgpmaQo=" | base64 -d > "/tmp/check-pnpm-volume.sh" && chmod +rx "/tmp/check-pnpm-volume.sh"

USER ubuntu
ENV HOME=/home/ubuntu

RUN mkdir -p "$HOME/.config/fish/conf.d" && echo "YWJiciAtYSAtLSBucG0gcG5wbQo=" | base64 -d > "$HOME/.config/fish/conf.d/pnpm.fish" && chmod +r "$HOME/.config/fish/conf.d/pnpm.fish"

RUN mise use -g pnpm
RUN echo "store-dir=$HOME/.cache/pnpm\npackage-import-method=copy" > $HOME/.npmrc

LABEL "org.opencontainers.image.description"="VSCode devcontainer for javascript-pnpm" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
