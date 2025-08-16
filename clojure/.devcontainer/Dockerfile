FROM ghcr.io/dhhyi/dcc-base-java

ADD https://github.com/clojure/brew-install/releases/latest/download/posix-install.sh /tmp
RUN chmod +x /tmp/posix-install.sh && /tmp/posix-install.sh
ADD https://raw.githubusercontent.com/clojure-lsp/clojure-lsp/master/install /tmp/install-clojure-lsp.sh
RUN bash /tmp/install-clojure-lsp.sh
RUN echo > /conda-notice.txt

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for clojure" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
