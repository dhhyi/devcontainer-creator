FROM ghcr.io/dhhyi/dcc-base-debian:latest

RUN locale-gen --no-purge en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8
ADD https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb /tmp/erlang-repo.deb
RUN dpkg -i /tmp/erlang-repo.deb

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    esl-erlang elixir \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

RUN echo 'export PS1="$ "' >> $HOME/.bashrc && echo '\nexport PS1="$ "' >> $HOME/.zshrc
ENV DCC_BINARY="elixir" DCC_REPL="iex" DCC_VERSION="elixir --version" DCC_SELFTEST="ZWxpeGlyIC1lICdJTy5wdXRzICJIZWxsbyBXb3JsZCEiJw=="
