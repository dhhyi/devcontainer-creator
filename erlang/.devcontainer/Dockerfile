FROM ghcr.io/dhhyi/dcc-base-debian

RUN locale-gen --no-purge en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8
ADD https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb /tmp/erlang-repo.deb
RUN dpkg -i /tmp/erlang-repo.deb

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    esl-erlang \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://s3.amazonaws.com/rebar3/rebar3 /usr/local/bin/rebar3
RUN chmod +rx /usr/local/bin/rebar3

USER vscode
ENV HOME=/home/vscode

RUN mkdir -p "${HOME}/.config/rebar3" && echo "e3BsdWdpbnMsIFtlcmxmbXRdfS4Ke2VybGZtdCwgW3dyaXRlXX0uCg==" | base64 -d > "${HOME}/.config/rebar3/rebar.config" && chmod +r "${HOME}/.config/rebar3/rebar.config"
