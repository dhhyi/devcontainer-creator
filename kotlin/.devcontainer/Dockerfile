FROM ghcr.io/dhhyi/dcc-base-java

ARG KOTLIN_VERSION

ADD https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-native-linux-x86_64-${KOTLIN_VERSION}.tar.gz /opt/kotlin/kotlin.tar.gz
RUN cd /opt/kotlin && tar zxpf kotlin.tar.gz --strip-components=1
ENV PATH=/opt/kotlin/bin:${PATH}

USER vscode
