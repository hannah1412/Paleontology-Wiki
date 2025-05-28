#!/bin/bash

RUN_NAME="$(date '+%d%m%yT%H%M%S')"
BRANCH=${BRANCH:-main}
echo "Using git branch $BRANCH"

if [[ $# -eq 0 ]]; then
  TMPDIR=$(mktemp -d --suffix "pipeline-$RUN_NAME")
else
  # user gave bad path that doesnt exist
  if [ ! -d "$1" ]; then
    echo "Bad argument: argument should be an existing directory to run pipeline in!"
    exit 1
  fi
  TMPDIR=$(realpath $1)
fi

# always run this script in this dir!
cd $(dirname $0) 

echo "Running in $TMPDIR"
rm -rf "$TMPDIR/repo"
mkdir -p "$TMPDIR" "$TMPDIR/repo" "$TMPDIR/data"
git clone git@gitlab.cs.st-andrews.ac.uk:cs3099sg2/project-code --branch $BRANCH "$TMPDIR/repo"
cp ../.env "$TMPDIR/repo/.env"
cd "$TMPDIR"

if ! command -v poetry &> /dev/null
then
  curl -sSL https://install.python-poetry.org | python3 -
fi

cd repo/batchpipe
tmux set-option -g remain-on-exit failed
poetry env use /usr/local/python/bin/python3.11
poetry install
# if error, keep the tmux pane open
tmux new-window -c "$TMPDIR/data" -t cs3099: -n "$RUN_NAME" -dP "LUIGI_CONFIG_PATH=$HOME/luigid/luigi.cfg poetry -C ../repo/batchpipe run luigi --module batchpipe.tasks Pipeline --scheduler-port 24845 --workers 5 --worker-keep-alive --logging-conf-file /home/cs3099usersg2/luigid/logging.cfg"
