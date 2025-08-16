FROM ghcr.io/dhhyi/dcc-devcontainer-javascript

USER root

RUN mkdir -p "/tmp" && echo "IyEvYmluL2Jhc2gKaWYgISBtb3VudCB8IGdyZXAgLXEgJEhPTUUvLmNhY2hlL3BucG07IHRoZW4KICBlY2hvIC1lICJcZVszMW1XQVJOSU5HOiBpdCBpcyByZWNvbW1lbmRlZCB0byBtb3VudCAkSE9NRS8uY2FjaGUvcG5wbSBhcyBhIG5hbWVkIHZvbHVtZVxlWzBtIgpmaQo=" | base64 -d > "/tmp/check-pnpm-volume.sh" && chmod +rx "/tmp/check-pnpm-volume.sh"

USER ubuntu
ENV HOME=/home/ubuntu

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.zshrc" SHELL="$(which sh)" sh -
RUN echo "alias npm=pnpm" | tee -a $HOME/.zshrc && echo "store-dir=$HOME/.cache/pnpm\npackage-import-method=copy" > $HOME/.npmrc

LABEL "org.opencontainers.image.description"="VSCode devcontainer for javascript-pnpm" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
