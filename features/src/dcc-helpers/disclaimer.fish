#!/usr/bin/env fish

if type -q mise
    if [ -d "$1" ]
        cd "$1"
        if [ -f "mise.toml" ]
            mise trust mise.toml
        end
    end
    mise install --yes
    mise list
end
