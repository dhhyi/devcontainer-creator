ARG NODE_VERSION

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${NODE_VERSION}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    inotify-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN npm i -g ts-node

COPY cont.sh /usr/local/bin/cont
RUN chmod +x /usr/local/bin/cont

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER node

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
