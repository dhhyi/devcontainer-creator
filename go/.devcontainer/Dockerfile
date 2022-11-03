FROM ghcr.io/dhhyi/dcc-base-go:latest

USER vscode

RUN go install github.com/traefik/yaegi/cmd/yaegi@latest

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
