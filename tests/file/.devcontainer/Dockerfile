FROM ghcr.io/dhhyi/dcc-base-debian

RUN mkdir -p "/usr/local/bin" && echo "ZWNobyAnSGVsbG8gV29ybGQhJw==" | base64 -d > "/usr/local/bin/testme" && chmod +rx "/usr/local/bin/testme"

USER vscode
ENV HOME=/home/vscode

RUN mkdir -p "${HOME}/.config/test" && echo "RU1QVFk=" | base64 -d > "${HOME}/.config/test/test.file" && chmod +r "${HOME}/.config/test/test.file"
