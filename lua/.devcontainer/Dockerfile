FROM ghcr.io/dhhyi/dcc-devcontainer-debian

USER root

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential cmake && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG LUA_VERSION
ARG LUAROCKS_VERSION

ADD http://www.lua.org/ftp/lua-${LUA_VERSION}.tar.gz /tmp
RUN cd /tmp && tar zxf lua-$LUA_VERSION.tar.gz && cd lua-$LUA_VERSION && make all test && make install
ADD https://luarocks.org/releases/luarocks-${LUAROCKS_VERSION}.tar.gz /tmp
RUN cd /tmp && tar zxpf luarocks-$LUAROCKS_VERSION.tar.gz && cd luarocks-$LUAROCKS_VERSION && ./configure && make && make install
RUN luarocks install busted
RUN luarocks install --server=https://luarocks.org/dev luaformatter
RUN luarocks install luacheck

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for lua" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
