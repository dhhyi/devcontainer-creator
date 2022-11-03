FROM ghcr.io/dhhyi/dcc-base-ruby:latest

RUN gem install rubocop

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
