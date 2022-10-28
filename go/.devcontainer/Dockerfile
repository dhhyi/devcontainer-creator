ARG GO_VERSION

FROM mcr.microsoft.com/devcontainers/go:${GO_VERSION}

USER vscode

RUN go install github.com/traefik/yaegi/cmd/yaegi@latest

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="go run" DCC_REPL="yaegi" DCC_VERSION="go version" DCC_SELFTEST="Y2F0ID4vdG1wL2hlbGxvd29ybGQuZ28gPDxFT0YKcGFja2FnZSBtYWluCmltcG9ydCAiZm10IgpmdW5jIG1haW4oKSB7IGZtdC5QcmludGxuKCJIZWxsbyBXb3JsZCEiKSB9CkVPRgpnbyBmbXQgL3RtcC9oZWxsb3dvcmxkLmdvCmNhdCAvdG1wL2hlbGxvd29ybGQuZ28KZ28gcnVuIC90bXAvaGVsbG93b3JsZC5nbwo="
