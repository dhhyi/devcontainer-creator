FROM mcr.microsoft.com/vscode/devcontainers/base:debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    tcl inotify-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY cont.sh /usr/local/bin/cont
RUN chmod +x /usr/local/bin/cont

COPY selftest.sh disclaimer.sh /
RUN chmod +x /selftest.sh /disclaimer.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
