FROM mcr.microsoft.com/vscode/devcontainers/javascript-node@sha256:2842f9e0624897d83accea2a2461e9091b55d4173e4455c1a24dc0f42d7acd24

RUN npm i -g elm elm-test elm-format elm-review onchange

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER node

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="" DCC_REPL="elm repl" DCC_VERSION="elm --version"
