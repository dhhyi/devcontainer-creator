FROM ghcr.io/dhhyi/dcc-base-debian:latest

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG LUAROCKS_VERSION
ARG LUA_VERSION

ADD http://www.lua.org/ftp/lua-${LUA_VERSION}.tar.gz /tmp
RUN cd /tmp && tar zxf lua-${LUA_VERSION}.tar.gz && cd lua-${LUA_VERSION} && make all test && make install
ADD https://luarocks.org/releases/luarocks-${LUAROCKS_VERSION}.tar.gz /tmp
RUN cd /tmp && tar zxpf luarocks-${LUAROCKS_VERSION}.tar.gz && cd luarocks-${LUAROCKS_VERSION} && ./configure && make && make install
RUN luarocks install busted
RUN luarocks install https://luarocks.org/manifests/leafo/moonscript-dev-1.rockspec
RUN luarocks install moonpick

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="moon" DCC_REPL="" DCC_VERSION="moonc -v ." DCC_SELFTEST="Y2F0ID4vdG1wL2hlbGxvd29ybGQubW9vbiA8PEVPRgpwcmludCAiSGVsbG8gV29ybGQhIgpFT0YKbW9vbiAvdG1wL2hlbGxvd29ybGQubW9vbgo="
