FROM ghcr.io/dhhyi/dcc-base-ruby:latest

RUN gem install rubocop

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="ruby" DCC_REPL="irb" DCC_VERSION="rubocop --version; ruby --version" DCC_SELFTEST="cnVieSAtZSAncHV0cyAiSGVsbG8gV29ybGQhIic="
