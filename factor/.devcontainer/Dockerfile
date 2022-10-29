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

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="factor -run" DCC_REPL="factor" DCC_VERSION="" DCC_SELFTEST="Y2F0ID4vdG1wL2hlbGxvd29ybGQuZmFjdG9yIDw8RU9GClVTRTogaW8KIkhlbGxvIFdvcmxkISIgcHJpbnQKRU9GCmZhY3RvciAtcnVuIC90bXAvaGVsbG93b3JsZC5mYWN0b3IK"
