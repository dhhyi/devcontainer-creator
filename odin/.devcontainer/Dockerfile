FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential clang llvm-14-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG ODIN_VERSION

ADD https://github.com/odin-lang/Odin/archive/refs/tags/${ODIN_VERSION}.tar.gz /tmp
RUN cd /tmp && tar zxpf ${ODIN_VERSION}.tar.gz && cd /tmp/Odin-${ODIN_VERSION} && make && ln -s /tmp/Odin-${ODIN_VERSION}/odin /usr/local/bin/odin

RUN mkdir -p "/usr/local/bin" && echo "IyEvYmluL3NoIC1lCmlmIFsgJCMgLWVxIDAgXTsgdGhlbgogICAgZWNobyAiVXNhZ2U6ICQwIDxmaWxlPiIKICAgIGV4aXQgMQpmaQppZiBbICEgLWYgIiQxIiBdOyB0aGVuCiAgICBlY2hvICJGaWxlICQxIGRvZXMgbm90IGV4aXN0IgogICAgZXhpdCAxCmZpCgpmaWxlPSIkKHJlYWRsaW5rIC1mICIkMSIpIgpzaGlmdApjZCAvdG1wCm9kaW4gcnVuICIkZmlsZSIgLWZpbGUgLS0gIiRAIgo=" | base64 -d > "/usr/local/bin/runodin" && chmod +rx "/usr/local/bin/runodin"

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for odin" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
