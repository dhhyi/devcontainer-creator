FROM ghcr.io/dhhyi/dcc-base-debian

ADD https://deno.land/x/install/install.sh /tmp/install.sh
RUN sh /tmp/install.sh && mv /root/.deno/bin/deno /usr/local/bin/deno

USER vscode
