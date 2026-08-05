FROM ghcr.io/dhhyi/dcc-devcontainer-debian

USER root

ARG FACTOR_VERSION

ADD https://downloads.factorcode.org/releases/${FACTOR_VERSION}/factor-linux-x86-64-${FACTOR_VERSION}.tar.gz /opt/factor.tar.gz
RUN cd /opt && tar zxpf factor.tar.gz
ENV PATH=/opt/factor:${PATH}

USER vscode
ENV HOME=/home/vscode

ARG WORKSPACE

RUN echo $WORKSPACE > $HOME/.factor-roots

LABEL "org.opencontainers.image.description"="VSCode devcontainer for factor" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
