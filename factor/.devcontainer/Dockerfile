FROM ghcr.io/dhhyi/dcc-base-debian:latest

ARG FACTOR_VERSION
ARG WORKSPACE

ADD https://downloads.factorcode.org/releases/${FACTOR_VERSION}/factor-linux-x86-64-${FACTOR_VERSION}.tar.gz /opt/factor.tar.gz
RUN cd /opt && tar zxpf factor.tar.gz
ENV PATH=/opt/factor:${PATH}
RUN echo ${WORKSPACE} > ${HOME}/.factor-roots

USER vscode
ENV HOME=/home/vscode

RUN echo ${WORKSPACE} > ${HOME}/.factor-roots
