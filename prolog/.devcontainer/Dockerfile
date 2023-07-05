FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG PROLOG_VERSION

ADD https://sourceforge.net/projects/gprolog/files/${PROLOG_VERSION}/gprolog-${PROLOG_VERSION}.tar.gz/download /tmp/gprolog-${PROLOG_VERSION}.tar.gz
RUN cd /tmp && tar -xvvf gprolog-${PROLOG_VERSION}.tar.gz
RUN cd /tmp/gprolog-${PROLOG_VERSION}/src && ./configure && make && make install && make check

USER vscode
