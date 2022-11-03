FROM ghcr.io/dhhyi/dcc-base-debian:latest

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="" DCC_REPL="bash" DCC_VERSION="" DCC_SELFTEST=""
