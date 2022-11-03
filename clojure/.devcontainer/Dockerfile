FROM ghcr.io/dhhyi/dcc-base-java:latest

ARG CLOJURE_VERSION

ADD https://download.clojure.org/install/linux-install-${CLOJURE_VERSION}.sh /tmp
RUN chmod +x /tmp/linux-install-${CLOJURE_VERSION}.sh && /tmp/linux-install-${CLOJURE_VERSION}.sh
ADD https://raw.githubusercontent.com/clojure-lsp/clojure-lsp/master/install /tmp/install-clojure-lsp.sh
RUN bash /tmp/install-clojure-lsp.sh
RUN echo > /conda-notice.txt

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
