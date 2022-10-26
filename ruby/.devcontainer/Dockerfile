FROM mcr.microsoft.com/vscode/devcontainers/ruby@sha256:4efe33f4550d6c9396ed10ebf66153d21689256bdbf4015c5c90bfe82e11f18b

RUN gem install rubocop

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="ruby" DCC_REPL="irb" DCC_VERSION="rubocop --version;ruby --version"
