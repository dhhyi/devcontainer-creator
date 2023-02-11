FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG QBE_VERSION

ADD https://c9x.me/compile/release/qbe-${QBE_VERSION}.tar.xz /tmp
RUN cd /tmp && tar xpfv /tmp/qbe-${QBE_VERSION}.tar.xz && cd /tmp/qbe-${QBE_VERSION} && make && make install
RUN git clone https://git.sr.ht/~sircmpwn/scdoc --depth 1 /tmp/scdoc && cd /tmp/scdoc && make && make install
RUN git clone https://git.sr.ht/~sircmpwn/harec --depth 1 /tmp/harec && cd /tmp/harec && mkdir build && cd build && ../configure && make && make install
RUN git clone https://git.sr.ht/~sircmpwn/hare --depth 1 /tmp/hare && cd /tmp/hare && cp config.example.mk config.mk && make && make install

USER vscode
