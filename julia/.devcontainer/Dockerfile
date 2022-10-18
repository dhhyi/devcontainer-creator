FROM mcr.microsoft.com/vscode/devcontainers/base:0.202.8-debian-10

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    inotify-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG JULIA_BASE_VERSION
ARG JULIA_MINOR_VERSION

ADD https://julialang-s3.julialang.org/bin/linux/x64/${JULIA_BASE_VERSION}/julia-${JULIA_BASE_VERSION}.${JULIA_MINOR_VERSION}-linux-x86_64.tar.gz /opt/julia.tar.gz
RUN cd /opt && tar -xpf julia.tar.gz
ENV PATH=/opt/julia-${JULIA_BASE_VERSION}.${JULIA_MINOR_VERSION}/bin:${PATH}

COPY cont.sh /usr/local/bin/cont
RUN chmod +x /usr/local/bin/cont

COPY selftest.sh disclaimer.sh /
RUN chmod +x /selftest.sh /disclaimer.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
