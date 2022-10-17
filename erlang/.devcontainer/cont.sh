#!/bin/sh

[ -z "$*" ] && echo "Usage: $0 <watch> <command>..." && exit 1

if [ "$#" -eq "1" ]
then
    watch=$1
    command="escript $1"
else
    watch="$1"
    shift
    command="$*"
fi

echo "continuously running '$command' watching '$watch'"

inotifywait -q -m -e close_write,create --recursive $watch | \
  (
    while
        if [ ! -z "$PID" ] && ps -p $PID > /dev/null
        then
            kill -9 $PID
        fi
        $command <&1 &
        PID=$!
        read -r filename event
    do
        :
    done
  )
