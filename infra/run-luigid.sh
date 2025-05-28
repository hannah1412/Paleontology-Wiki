#!/bin/bash

# always run this script in this dir!
cd $(dirname "$0")

# we must run this in the cs3099 tmux session.
tmux list-sessions | grep "cs3099" || { echo "Cannot find the cs3099 tmux session! Run ./start-tmux.sh and try again!"; exit 1; }

# is it already running?
tmux list-windows -t cs3099 | grep "luigid" && { echo "Luigid is already running (or atleast its tmux window is). If you want to restart it, close that window and try again!"; exit 1; }

mkdir -p ~/luigid

if [ ! -f ~/luigid/luigi.cfg ]; then
  echo "No luigi.cfg found! Copy and modify the example in this repo to ~/luigid/luigi.cfg, then rerun this script."
  exit 1
fi

if [ ! -f ~/luigid/logging.cfg ]; then
  echo "No logging.cfg found! Copy and modify the example in this repo to ~/luigid/logging.cfg, then rerun this script."
  exit 1
fi

cd ~/luigid
python3 -m venv .venv
source .venv/bin/activate

pip install luigi 
pip install 'sqlalchemy<2.0' # for luigid's history database

mkdir -p var/ var/log

# new tmux window in cs3099 called luigid running in the current working directory.
tmux new-window -c $(pwd) -t cs3099: -n luigid -dP "source .venv/bin/activate && luigid --pidfile var/pid --logdir var/log --state-path var/state.pickle --port 24845"

