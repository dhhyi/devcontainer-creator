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

# shellcheck disable=SC2016 # no expand
ZSH_PROMPT='%{$reset_color%}%(?:$:%{$fg[red]%}$)%{$reset_color%} '
printf "%b" "PROMPT='$ZSH_PROMPT'\n" > "$HOME/.oh-my-zsh/themes/dcc.zsh-theme"
sed -i 's/^ZSH_THEME=.*/ZSH_THEME="dcc"/g' "$HOME/.zshrc"

BASH_PROMPT='\nexport PS1="$ "\n'
printf "%b" "$BASH_PROMPT" >> "$HOME/.bashrc"

echo "setting EDITOR and GIT_EDITOR"
tee -a "$HOME/.bashrc" "$HOME/.zshrc" > /dev/null << EOF

if cat /proc/\$PPID/cmdline | grep -q vscode-server; then
  export EDITOR='code --wait'
  export GIT_EDITOR='code --wait'
fi
EOF

echo "enabling ohmyzsh auto-update"
sed -i '/^DISABLE_AUTO_UPDATE=.*/d' "$HOME/.zshrc"
sed -i "/^DISABLE_UPDATE_PROMPT=.*/d" "$HOME/.zshrc"
sed -i "/^zstyle ':omz:update' mode.*/d" "$HOME/.zshrc"
sed -i "/^zstyle ':omz:update' frequency.*/d" "$HOME/.zshrc"
cat >> "$HOME/.zshrc" << EOF

zstyle ':omz:update' mode auto
zstyle ':omz:update' frequency 1

EOF

echo "setting up lazygit config"
mkdir -p "$HOME/.config/lazygit"
cat > "$HOME/.config/lazygit/config.yml" << EOF
os:
  editPreset: "vscode"

EOF
