ARG NODE_VERSION

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${NODE_VERSION}

RUN npm i -g ts-node

USER node

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="ts-node" DCC_REPL="ts-node" DCC_VERSION="ts-node -vvv" DCC_SELFTEST="dHMtbm9kZSAtZSAnY29uc29sZS5sb2coIkhlbGxvIFdvcmxkISIpOyc="
