FROM mcr.microsoft.com/vscode/devcontainers/base:debian

ARG JULIA_BASE_VERSION
ARG JULIA_MINOR_VERSION

ADD https://julialang-s3.julialang.org/bin/linux/x64/${JULIA_BASE_VERSION}/julia-${JULIA_BASE_VERSION}.${JULIA_MINOR_VERSION}-linux-x86_64.tar.gz /opt/julia.tar.gz
RUN cd /opt && tar -xpf julia.tar.gz
ENV PATH=/opt/julia-${JULIA_BASE_VERSION}.${JULIA_MINOR_VERSION}/bin:${PATH}

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="julia" DCC_REPL="julia" DCC_VERSION="julia --version" DCC_SELFTEST="anVsaWEgLWUgJ3ByaW50bG4oIkhlbGxvIFdvcmxkISIpJw=="
