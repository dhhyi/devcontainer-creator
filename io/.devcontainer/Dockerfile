FROM mcr.microsoft.com/vscode/devcontainers/base@sha256:3b7d8bb13c1d9eadffa1c1b8cfcf0288b71355771f02ab8dbe055d29023b6091

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential libpcre3-dev libevent-dev cmake \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode
ENV HOME=/home/vscode

ARG IO_VERSION

RUN git clone -b ${IO_VERSION} --single-branch --depth 1 --recursive https://github.com/IoLanguage/io.git /tmp/io
RUN cd /tmp/io && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=release .. && make && sudo make install && io setup.io
ENV EERIEDIR=${HOME}/.eerie PATH=${PATH}:${HOME}/.eerie/base/bin:${HOME}/.eerie/activeEnv/bin
WORKDIR ${HOME}
RUN eerie install https://github.com/IoLanguage/Regex.git
RUN eerie install https://github.com/IoLanguage/Random.git

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="io" DCC_REPL="io" DCC_VERSION="io --version"
