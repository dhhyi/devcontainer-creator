FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG V_VERSION

ADD https://github.com/vlang/v/releases/download/${V_VERSION}/v_linux.zip /opt
RUN cd /opt && unzip v_linux.zip && /opt/v/v symlink && chmod o+w -Rfv /opt/v/cmd/tools

USER vscode
