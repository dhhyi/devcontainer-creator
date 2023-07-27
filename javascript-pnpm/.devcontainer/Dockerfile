FROM ghcr.io/dhhyi/dcc-devcontainer-javascript

USER root

RUN mkdir -p "/tmp" && echo "IyEvYmluL2Jhc2gKaWYgISBtb3VudCB8IGdyZXAgLXEgL2hvbWUvcG5wbTsgdGhlbgogIGVjaG8gLWUgIlxlWzMxbVdBUk5JTkc6IGl0IGlzIHJlY29tbWVuZGVkIHRvIG1vdW50IC9ob21lL3BucG0gYXMgYSBuYW1lZCB2b2x1bWVcZVswbSIKZmkK" | base64 -d > "/tmp/check-pnpm-volume.sh" && chmod +rx "/tmp/check-pnpm-volume.sh"

USER vscode
ENV HOME=/home/vscode

RUN npm install -g pnpm
RUN echo "alias npm=pnpm" | tee -a $HOME/.zshrc $HOME/.bashrc && echo "store-dir=/home/pnpm\npackage-import-method=copy" > $HOME/.npmrc
