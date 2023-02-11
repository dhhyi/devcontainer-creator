FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends xz-utils && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://ziglang.org/download/0.10.1/zig-linux-x86_64-0.10.1.tar.xz /tmp/zig.tar.xz
RUN mkdir -p /opt/zig && tar -xf /tmp/zig.tar.xz -C /opt/zig --strip-components=1
ENV PATH=/opt/zig:$PATH

USER vscode
