ARG GO_VERSION

FROM mcr.microsoft.com/devcontainers/go:${GO_VERSION}

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN go install github.com/traefik/yaegi/cmd/yaegi@latest

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="go run" DCC_REPL="yaegi" DCC_VERSION="go version"
