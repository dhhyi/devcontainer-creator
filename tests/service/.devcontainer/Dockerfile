FROM ghcr.io/dhhyi/dcc-base-debian

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install --no-install-recommends runit && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p "/etc/service/app" && echo "IyEvYmluL2Jhc2gKZXhlYyAvaG9tZS92c2NvZGUvc2VydmljZS9hcHAuc2gK" | base64 -d > "/etc/service/app/run" && chmod +rx "/etc/service/app/run"

USER vscode
ENV HOME=/home/vscode

RUN mkdir -p "$HOME/service" && echo "IyEvYmluL2Jhc2gKc2V0IC1lCmVjaG8gMSA+PiB0ZXN0LmxvZ34KcHdkID4+IC90bXAvdGVzdC5sb2d+CnNsZWVwIGluZmluaXR5Cgo=" | base64 -d > "$HOME/service/app.sh" && chmod +rx "$HOME/service/app.sh"

CMD ["sudo", "runsvdir", "/etc/service"]
