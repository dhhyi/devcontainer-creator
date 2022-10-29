FROM ghcr.io/dhhyi/dcc-base-debian:latest

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

COPY --chown=vscode rebar.config ${HOME}/.config/rebar3/rebar.config

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="escript" DCC_REPL="erl" DCC_VERSION="erl +V" DCC_SELFTEST="Y2F0ID4gL3RtcC9oZWxsb3dvcmxkLmVybCA8PEVPRgotbW9kdWxlKGhlbGxvd29ybGQpLiAtZXhwb3J0KFttYWluLzFdKS4KbWFpbihfKSAtPiAgICBpbzpmb3JtYXQoIkhlbGxvIFdvcmxkIVxuIikuCkVPRgpjZCAvdG1wCnJlYmFyMyBmbXQgLXcgaGVsbG93b3JsZC5lcmwKY2F0IGhlbGxvd29ybGQuZXJsCmVzY3JpcHQgaGVsbG93b3JsZC5lcmwK"
