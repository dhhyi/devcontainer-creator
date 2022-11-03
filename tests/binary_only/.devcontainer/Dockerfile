FROM ghcr.io/dhhyi/dcc-base-debian:latest

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="bash" DCC_REPL="" DCC_VERSION="bash --version" DCC_SELFTEST="YmFzaCAtYyAiZWNobyAnSGVsbG8gV29ybGQhJyI="
