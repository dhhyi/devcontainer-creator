FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends chezscheme build-essential libgmp-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG IDRIS2_VERSION

RUN mkdir -p "/usr/local/bin" && echo "IyEvYmluL3NoIC1lCgppZiBbICQjIC1lcSAwIF07IHRoZW4KICAgIGVjaG8gIlVzYWdlOiAkMCA8ZmlsZT4iCiAgICBleGl0IDEKZmkKCmlmIFsgISAtZiAiJDEiIF07IHRoZW4KICAgIGVjaG8gIkZpbGUgJDEgZG9lcyBub3QgZXhpc3QiCiAgICBleGl0IDEKZmkKCm5hbWU9JChiYXNlbmFtZSAiJDEiIC5pZHIpCmRpcj0kKGRpcm5hbWUgIiQxIikKY2QgIiRkaXIiCgppZHJpczIgIiQxIiAtLWJ1aWxkLWRpciAvdG1wL2lkcmlzIC0tb3V0cHV0LWRpciAvdG1wL2lkcmlzIC1vICRuYW1lCi90bXAvaWRyaXMvJG5hbWUgIiRAIgo=" | base64 -d > "/usr/local/bin/runidris" && chmod +rx "/usr/local/bin/runidris"

RUN git clone --depth 1 --branch v${IDRIS2_VERSION} https://github.com/idris-lang/Idris2.git /tmp/idris2
RUN cd /tmp/idris2 && sed -i 's%PREFIX.*%PREFIX ?= /usr/local%' config.mk && make bootstrap SCHEME=chezscheme && make install

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for idris2" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
