FROM ghcr.io/dhhyi/dcc-base-python:latest

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="python" DCC_REPL="python" DCC_VERSION="python --version" DCC_SELFTEST="cHl0aG9uIC1jICdwcmludCgiSGVsbG8gV29ybGQhIikn"
