#!/usr/bin/env fish

if type -q mise
    if [ -d "$1" ]
        cd "$1"
    end
    # trust configs across the whole mounted repo, not just $1, so monorepo
    # siblings and parent mise.toml files are covered too
    set -l root "."
    if type -q git
        set -l git_root (git rev-parse --show-toplevel 2>/dev/null)
        if [ -n "$git_root" ]
            set root "$git_root"
        end
    end
    mise trust -a -y -C "$root"
    mise install --yes
    mise list
end
