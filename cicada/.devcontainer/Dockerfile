ARG NODE_VERSION

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${NODE_VERSION}

RUN npm --global install @cicada-lang/cicada

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER node

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="cic run" DCC_REPL="cic" DCC_VERSION="cic --version"
