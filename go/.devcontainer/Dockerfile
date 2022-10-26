FROM mcr.microsoft.com/devcontainers/go@sha256:bf4f64c8cd22c5d31561121f536ae3c1ab318ce01af4b002b148e44239aed354

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN go install github.com/traefik/yaegi/cmd/yaegi@latest

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="go run" DCC_REPL="yaegi" DCC_VERSION="go version"
