FROM mcr.microsoft.com/vscode/devcontainers/base

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    inotify-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG FACTOR_VERSION
ARG WORKSPACE

ADD https://downloads.factorcode.org/releases/${FACTOR_VERSION}/factor-linux-x86-64-${FACTOR_VERSION}.tar.gz /opt/factor.tar.gz
RUN cd /opt && tar zxpf factor.tar.gz
ENV PATH=/opt/factor:${PATH}
RUN echo ${WORKSPACE} > ${HOME}/.factor-roots

COPY cont.sh /usr/local/bin/cont
RUN chmod +x /usr/local/bin/cont

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode
ENV HOME=/home/vscode

RUN echo ${WORKSPACE} > ${HOME}/.factor-roots

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
