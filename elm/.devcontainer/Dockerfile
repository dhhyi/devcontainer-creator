ARG NODE_VERSION

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${NODE_VERSION}

RUN npm i -g elm elm-test elm-format elm-review onchange

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER node

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="" DCC_REPL="elm repl" DCC_VERSION="elm --version"
