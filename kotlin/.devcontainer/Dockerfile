FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends openjdk-17-jdk && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG KOTLIN_VERSION

RUN mkdir -p "/usr/bin" && echo "IyEvYmluL2Jhc2gKamF2YSAtamFyIC9vcHQva3RmbXQuamFyICIkQCIK" | base64 -d > "/usr/bin/ktfmt" && chmod +rx "/usr/bin/ktfmt"

ADD https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip /opt/kotlinc.zip
RUN cd /opt && unzip kotlinc.zip
ENV PATH=/opt/kotlinc/bin:${PATH}
ADD https://repo1.maven.org/maven2/com/facebook/ktfmt/0.44/ktfmt-0.44-jar-with-dependencies.jar /opt/ktfmt.jar
RUN chmod 644 /opt/ktfmt.jar

USER vscode

LABEL "org.opencontainers.image.description"="VSCode devcontainer for kotlin" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
