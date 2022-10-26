FROM mcr.microsoft.com/vscode/devcontainers/java@sha256:63f7d975e52099bc63cf63383be9443577337c3c3d09d79b405c2ca266c9e470

ARG CLOJURE_VERSION

ADD https://download.clojure.org/install/linux-install-${CLOJURE_VERSION}.sh /tmp
RUN chmod +x /tmp/linux-install-${CLOJURE_VERSION}.sh && /tmp/linux-install-${CLOJURE_VERSION}.sh
ADD https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein /usr/local/bin
RUN chmod +x /usr/local/bin/lein
RUN echo > /conda-notice.txt

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="clojure -M" DCC_REPL="lein repl" DCC_VERSION="clojure --version"
