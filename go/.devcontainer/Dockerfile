FROM ghcr.io/dhhyi/dcc-base-debian

ARG GO_VERSION

ADD https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz /tmp/go.tar.gz
RUN tar -C /opt -xzf /tmp/go.tar.gz
ENV PATH=/opt/go/bin:$PATH

USER vscode
ENV HOME=/home/vscode

RUN go install github.com/traefik/yaegi/cmd/yaegi@latest
RUN go install -v golang.org/x/tools/gopls@latest
RUN go install -v github.com/go-delve/delve/cmd/dlv@latest
RUN go install -v honnef.co/go/tools/cmd/staticcheck@latest
RUN go install -v github.com/ramya-rao-a/go-outline@latest
ENV PATH=${HOME}/go/bin:${PATH}
RUN go install -v github.com/mitranim/gow@latest

LABEL "org.opencontainers.image.description"="VSCode devcontainer for go" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
