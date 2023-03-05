FROM ghcr.io/dhhyi/dcc-base-debian

ARG GO_VERSION

ADD https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz /tmp/go.tar.gz
RUN tar -C /opt -xzf /tmp/go.tar.gz
ENV PATH=/opt/go/bin:$PATH

USER vscode

RUN go install github.com/traefik/yaegi/cmd/yaegi@latest
