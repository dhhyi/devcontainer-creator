FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential libpcre3-dev libevent-dev cmake \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode
ENV HOME=/home/vscode

ARG IO_VERSION

RUN git clone -b ${IO_VERSION} --single-branch --depth 1 --recursive https://github.com/IoLanguage/io.git /tmp/io
RUN cd /tmp/io && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=release .. && make && sudo make install && io setup.io
ENV EERIEDIR=${HOME}/.eerie PATH=${PATH}:${HOME}/.eerie/base/bin:${HOME}/.eerie/activeEnv/bin
WORKDIR ${HOME}
RUN eerie install https://github.com/IoLanguage/Regex.git
RUN eerie install https://github.com/IoLanguage/Random.git
