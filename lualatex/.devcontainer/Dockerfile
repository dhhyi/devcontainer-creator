FROM ghcr.io/dhhyi/dcc-devcontainer-lua

USER root

RUN mkdir -p "/root" && echo "YXB0LWdldCB1cGRhdGUgJiYgYXB0LWdldCBpbnN0YWxsIC15IC0tbm8taW5zdGFsbC1yZWNvbW1lbmRzIGBhcHQtZ2V0IC0tYXNzdW1lLW5vIGluc3RhbGwgdGV4bGl2ZS1mdWxsIHwgYXdrICcvVGhlIGZvbGxvd2luZyBhZGRpdGlvbmFsIHBhY2thZ2VzIHdpbGwgYmUgaW5zdGFsbGVkL3tmPTE7bmV4dH0gL1N1Z2dlc3RlZCBwYWNrYWdlcy97Zj0wfSBmJyB8IHRyICcgJyAnXG4nIHwgZ3JlcCAtdlAgJ2RvYyQnIHwgZ3JlcCAtdlAgJ3RleGxpdmUtbGFuZycgfCBncmVwIC12UCAnbGF0ZXgtY2prJyB8IHRyICdcbicgJyAnYCB0ZXhsaXZlLWxhbmctZW5nbGlzaCB0ZXhsaXZlLWxhbmctZXVyb3BlYW4gdGV4bGl2ZS1sYW5nLWZyZW5jaCB0ZXhsaXZlLWxhbmctZ2VybWFuIGxpYnlhbWwtdGlueS1wZXJsIGxpYmZpbGUtaG9tZWRpci1wZXJs" | base64 -d > "/root/install-latex.sh" && chmod +rx "/root/install-latex.sh"

RUN sh /root/install-latex.sh

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for lualatex" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
