FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential clang llvm-11-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://github.com/odin-lang/Odin/archive/refs/tags/dev-2023-02.tar.gz /tmp
RUN cd /tmp && tar zxpf dev-2023-02.tar.gz && cd /tmp/Odin-dev-2023-02 && make && ln -s /tmp/Odin-dev-2023-02/odin /usr/local/bin/odin

RUN mkdir -p "/usr/local/bin" && echo "IyEvYmluL3NoIC1lCmlmIFsgJCMgLWVxIDAgXTsgdGhlbgogICAgZWNobyAiVXNhZ2U6ICQwIDxmaWxlPiIKICAgIGV4aXQgMQpmaQppZiBbICEgLWYgIiQxIiBdOyB0aGVuCiAgICBlY2hvICJGaWxlICQxIGRvZXMgbm90IGV4aXN0IgogICAgZXhpdCAxCmZpCgpmaWxlPSIkKHJlYWRsaW5rIC1mICIkMSIpIgpzaGlmdApjZCAvdG1wCm9kaW4gcnVuICIkZmlsZSIgLWZpbGUgLS0gIiRAIgo=" | base64 -d > "/usr/local/bin/runodin" && chmod +rx "/usr/local/bin/runodin"

USER vscode
