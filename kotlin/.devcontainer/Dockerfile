FROM ghcr.io/dhhyi/dcc-devcontainer-java

USER root

ARG KTFMT_VERSION

RUN mkdir -p "/usr/bin" && echo "IyEvYmluL2Jhc2gKamF2YSAtamFyIC9vcHQva3RmbXQuamFyICIkQCIK" | base64 -d > "/usr/bin/ktfmt" && chmod +rx "/usr/bin/ktfmt"

ADD https://repo1.maven.org/maven2/com/facebook/ktfmt/${KTFMT_VERSION}/ktfmt-${KTFMT_VERSION}-with-dependencies.jar /opt/ktfmt.jar
RUN chmod 644 /opt/ktfmt.jar

USER vscode

RUN mise use -g kotlin

LABEL "org.opencontainers.image.description"="VSCode devcontainer for kotlin" "org.opencontainers.image.source"="https://github.com/dhhyi/devcontainer-creator"
