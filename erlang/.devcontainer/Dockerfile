FROM mcr.microsoft.com/vscode/devcontainers/base:0.202.8-debian-10

RUN locale-gen --no-purge en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8
ADD https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb /tmp/erlang-repo.deb
RUN dpkg -i /tmp/erlang-repo.deb

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    esl-erlang inotify-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://s3.amazonaws.com/rebar3/rebar3 /usr/local/bin/rebar3
RUN chmod +rx /usr/local/bin/rebar3

COPY cont.sh /usr/local/bin/cont
RUN chmod +x /usr/local/bin/cont

COPY selftest.sh disclaimer.sh /
RUN chmod +x /selftest.sh /disclaimer.sh

USER vscode
ENV HOME=/home/vscode

COPY --chown=vscode rebar.config ${HOME}/.config/rebar3/rebar.config

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
