FROM mcr.microsoft.com/vscode/devcontainers/base@sha256:3b7d8bb13c1d9eadffa1c1b8cfcf0288b71355771f02ab8dbe055d29023b6091

ARG FACTOR_VERSION
ARG WORKSPACE

ADD https://downloads.factorcode.org/releases/${FACTOR_VERSION}/factor-linux-x86-64-${FACTOR_VERSION}.tar.gz /opt/factor.tar.gz
RUN cd /opt && tar zxpf factor.tar.gz
ENV PATH=/opt/factor:${PATH}
RUN echo ${WORKSPACE} > ${HOME}/.factor-roots

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode
ENV HOME=/home/vscode

RUN echo ${WORKSPACE} > ${HOME}/.factor-roots

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="factor -run" DCC_REPL="factor" DCC_VERSION=""
