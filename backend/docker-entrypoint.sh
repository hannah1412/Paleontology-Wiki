#!/bin/bash
# ./backend is mounted at /mount


cd /mount
set -a
source .env
set +a

cd /mount/backend
python3.11 -m venv .venv
source .venv/bin/activate
python3.11 -m pip install -r requirements.txt

if [ "$RUN_ENV" == "dev" ]; then
  python3.11 app.py
else
  waitress-serve --port="$BACKEND_PORT" app:app
fi


