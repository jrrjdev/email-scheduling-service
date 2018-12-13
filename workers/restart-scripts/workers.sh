#!/bin/bash

NAME="email-service-worker.js"
RUN=`pgrep -f $NAME`

if [ "$RUN" == "" ]; then
 /usr/bin/tmux send-keys -t 0 "NODE_ENV=production node /home/jrrjdev/workers/email-service-worker/$NAME" 'C-m'
 echo "$NAME starts"
else
 echo "$NAME is running"
fi
