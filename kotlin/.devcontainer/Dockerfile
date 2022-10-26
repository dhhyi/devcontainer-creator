FROM mcr.microsoft.com/vscode/devcontainers/java@sha256:63f7d975e52099bc63cf63383be9443577337c3c3d09d79b405c2ca266c9e470

ARG KOTLIN_VERSION

ADD https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-native-linux-x86_64-${KOTLIN_VERSION}.tar.gz /opt/kotlin/kotlin.tar.gz
RUN cd /opt/kotlin && tar zxpf kotlin.tar.gz --strip-components=1
ENV PATH=/opt/kotlin/bin:${PATH}

COPY selftest.sh /
RUN chmod +x /selftest.sh

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="" DCC_REPL="" DCC_VERSION=""
