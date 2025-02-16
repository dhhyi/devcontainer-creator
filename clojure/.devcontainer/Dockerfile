FROM ghcr.io/dhhyi/dcc-base-java

ARG CLOJURE_VERSION

ADD https://download.clojure.org/install/linux-install-${CLOJURE_VERSION}.sh /tmp
RUN chmod +x /tmp/linux-install-${CLOJURE_VERSION}.sh && /tmp/linux-install-${CLOJURE_VERSION}.sh
ADD https://raw.githubusercontent.com/clojure-lsp/clojure-lsp/master/install /tmp/install-clojure-lsp.sh
RUN bash /tmp/install-clojure-lsp.sh
RUN echo > /conda-notice.txt

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for clojure" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
