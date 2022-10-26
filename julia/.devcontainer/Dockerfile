FROM mcr.microsoft.com/vscode/devcontainers/base@sha256:3b7d8bb13c1d9eadffa1c1b8cfcf0288b71355771f02ab8dbe055d29023b6091

ARG JULIA_BASE_VERSION
ARG JULIA_MINOR_VERSION

ADD https://julialang-s3.julialang.org/bin/linux/x64/${JULIA_BASE_VERSION}/julia-${JULIA_BASE_VERSION}.${JULIA_MINOR_VERSION}-linux-x86_64.tar.gz /opt/julia.tar.gz
RUN cd /opt && tar -xpf julia.tar.gz
ENV PATH=/opt/julia-${JULIA_BASE_VERSION}.${JULIA_MINOR_VERSION}/bin:${PATH}

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="julia" DCC_REPL="julia" DCC_VERSION="julia --version"
