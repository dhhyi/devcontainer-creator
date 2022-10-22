ARG RUBY_VERSION

FROM mcr.microsoft.com/vscode/devcontainers/ruby:0-${RUBY_VERSION}

RUN gem install rubocop

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="ruby" DCC_REPL="irb" DCC_VERSION="rubocop --version;ruby --version"
