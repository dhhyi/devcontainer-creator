FROM ghcr.io/dhhyi/dcc-base-node:latest

RUN npm --global install @cicada-lang/cicada

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="cic run" DCC_REPL="cic" DCC_VERSION="cic --version" DCC_SELFTEST="Y2F0ID4vdG1wL2hlbGxvd29ybGQuY2ljIDw8RU9GCmxldCBncmVldGluZyA9ICJIZWxsbywgV29ybGQhIgpjb21wdXRlIGdyZWV0aW5nCkVPRgpjaWMgL3RtcC9oZWxsb3dvcmxkLmNpYwo="
