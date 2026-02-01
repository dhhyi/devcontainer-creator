#!/bin/sh -e

cd "$(dirname "$0")"

echo "creating /disclaimer.sh"
# shellcheck disable=SC2016 # no expand
envsubst '$DCC_VERSION,$DCC_BINARY,$DCC_REPL' < disclaimer.sh > /disclaimer.sh
chmod +x /disclaimer.sh

if [ -n "$DCC_BINARY" ]; then
    echo "creating /usr/local/bin/cont"
    # shellcheck disable=SC2016 # no expand
    envsubst '$DCC_VERSION,$DCC_BINARY,$DCC_REPL' < cont.sh > /usr/local/bin/cont
    chmod +x /usr/local/bin/cont
fi

echo "creating /selftest.sh"
cat > /selftest.sh << EOF
#!/bin/sh -ex

$DCC_VERSION

EOF
if [ -n "$DCC_SELFTEST" ]; then
    echo "$DCC_SELFTEST" | base64 -d >> /selftest.sh
fi
chmod +x /selftest.sh

echo "setting shell prompt"

BASH_PROMPT='\nexport PS1="$ "\n'
printf "%b" "$BASH_PROMPT" >> "$HOME/.bashrc"

echo "setting EDITOR and GIT_EDITOR"
tee -a "$HOME/.bashrc" > /dev/null << EOF

if cat /proc/\$PPID/cmdline | grep -q vscode-server; then
  export EDITOR='code --wait'
  export GIT_EDITOR='code --wait'
fi
EOF

echo "setting up lazygit config"
mkdir -p "$HOME/.config/lazygit"
cat > "$HOME/.config/lazygit/config.yml" << EOF
os:
  editPreset: "vscode"

EOF
