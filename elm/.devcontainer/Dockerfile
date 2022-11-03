FROM ghcr.io/dhhyi/dcc-base-node:latest

RUN npm i -g elm elm-test elm-format elm-review onchange

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
