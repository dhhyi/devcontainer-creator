FROM mcr.microsoft.com/vscode/devcontainers/base@sha256:3b7d8bb13c1d9eadffa1c1b8cfcf0288b71355771f02ab8dbe055d29023b6091

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG PROLOG_VERSION

ADD http://www.gprolog.org/gprolog-${PROLOG_VERSION}.tar.gz /tmp
RUN cd /tmp && tar -xvvf gprolog-${PROLOG_VERSION}.tar.gz
RUN cd /tmp/gprolog-${PROLOG_VERSION}/src && ./configure && make && make install && make check

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="" DCC_REPL="gprolog" DCC_VERSION="gprolog --version"
