FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG PROLOG_VERSION

ADD http://www.gprolog.org/gprolog-${PROLOG_VERSION}.tar.gz /tmp
RUN cd /tmp && tar -xvvf gprolog-${PROLOG_VERSION}.tar.gz
RUN cd /tmp/gprolog-${PROLOG_VERSION}/src && ./configure && make && make install && make check

USER vscode
