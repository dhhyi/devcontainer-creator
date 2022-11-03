FROM ghcr.io/dhhyi/dcc-base-java:latest

ARG KOTLIN_VERSION

ADD https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-native-linux-x86_64-${KOTLIN_VERSION}.tar.gz /opt/kotlin/kotlin.tar.gz
RUN cd /opt/kotlin && tar zxpf kotlin.tar.gz --strip-components=1
ENV PATH=/opt/kotlin/bin:${PATH}

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
