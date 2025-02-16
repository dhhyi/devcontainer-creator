FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends tmux && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p "/" && echo "CiMhL2Jpbi9iYXNoCmlmIFsgLXogIiQqIiBdOyB0aGVuCiAgdG11eCBuZXctc2Vzc2lvbiAtQSAtcyB0bXV4CmZpCmV4ZWMgc2ggIiRAIgo=" | base64 -d > "/tmux-or-else.sh" && chmod +rx "/tmux-or-else.sh"

USER vscode
