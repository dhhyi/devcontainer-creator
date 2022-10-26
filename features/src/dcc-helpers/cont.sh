#!/bin/sh -e

[ -z "$*" ] && echo "Usage: $0 <watch> <command>..." && exit 1

if [ "$#" -eq "1" ]; then
    watch=$1
    command="$DCC_BINARY $1"
else
    watch="$1"
    shift
    command="$*"
fi

echo "continuously running '$command' watching '$watch'"

if command -v onchange > /dev/null; then
    onchange -ik "$watch" -- $command
else
    inotifywait -q -m -e close_write,create --recursive $watch \
        | (
            while
                if [ -n "$PID" ] && ps -p $PID > /dev/null; then
                    kill -9 $PID
                fi
                $command <&1 &
                PID=$!
                read -r filename event
            do
                :
            done
        )
fi
