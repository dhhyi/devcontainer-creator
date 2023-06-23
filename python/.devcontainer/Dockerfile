FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends python3 python3-pip black pylint flake8 python3-autopep8 mypy python-is-python3 && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode
