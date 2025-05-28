#!/bin/bash

# always run this script in this dir!
cd $(dirname "$0")

# avoid accidentially fucking up the entire file system because we forgot to put this in the run command
export DUID=$(id -u)

# we must run this in the cs3099 tmux session.
tmux list-sessions | grep "cs3099" && { echo "cs3099 tmux session already running"; exit 1; }
# echo "Adding ssh key to agent:"

# we now do this in bashrc, a la https://robinwinslow.uk/tmux-and-ssh-auto-login-with-ssh-agent-finally
#eval $(ssh-agent)
#ssh-add ~/.ssh/id_rsa

tmux new-session -c $(pwd) -s cs3099 bash
