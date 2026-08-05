FROM ghcr.io/dhhyi/dcc-devcontainer-ubuntu

USER root

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential libpcre3-dev libevent-dev cmake pkgconf && apt-get clean && rm -rf /var/lib/apt/lists/*

USER ubuntu
ENV HOME=/home/ubuntu

ARG IO_VERSION

RUN git clone --branch native --recursive https://github.com/IoLanguage/io.git /tmp/io
RUN cd /tmp/io && git checkout $IO_VERSION
RUN cd /tmp/io && mkdir build
RUN cd /tmp/io/build && cmake -DCMAKE_BUILD_TYPE=release ..
RUN cd /tmp/io/build && make
RUN cd /tmp/io/build && sudo make install
RUN cd /tmp/io/build && io_static setup.io
ENV EERIEDIR=${HOME}/.eerie PATH=${PATH}:${HOME}/.eerie/base/bin:${HOME}/.eerie/activeEnv/bin
WORKDIR ${HOME}
RUN eerie install https://github.com/IoLanguage/Regex.git
RUN eerie install https://github.com/IoLanguage/Random.git

LABEL "org.opencontainers.image.description"="VSCode devcontainer for io" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
