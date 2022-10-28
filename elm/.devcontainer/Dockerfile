ARG NODE_VERSION

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${NODE_VERSION}

RUN npm i -g elm elm-test elm-format elm-review onchange

USER node

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="" DCC_REPL="elm repl" DCC_VERSION="elm --version" DCC_SELFTEST="Y2F0ID4vdG1wL2hlbGxvd29ybGQuZWxtIDw8RU9GCm1vZHVsZSBIZWxsb1dvcmxkIGV4cG9zaW5nICguLikKaW1wb3J0IEh0bWwgZXhwb3NpbmcgKHRleHQpCm1haW4gPSB0ZXh0ICJIZWxsbyBXb3JsZCEiCkVPRgpjZCAvdG1wCmVjaG8gIlkiIHwgZWxtIGluaXQKZWxtIG1ha2UgaGVsbG93b3JsZC5lbG0KY2F0IGluZGV4Lmh0bWwgfCBncmVwICJIZWxsbyBXb3JsZCEiCg=="
