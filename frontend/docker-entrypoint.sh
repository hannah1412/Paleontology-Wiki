#!/bin/bash

npm install --force

export PATH="$PATH:$(npm bin)"

if ! [ -f ../.env ]; then
  echo "ENV FILE DOES NOT EXIST"
  exit 1
fi

set -a # export all variables
. ../.env
set +a

# reexport things  for nextjs to inline
#https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
export NEXT_PUBLIC_BACKEND_ADDR=$BACKEND_ADDR

# docker env file passing is not quite valid sh - 
# it interprets FOO="bar" to mean that FOO has value "bar" (with quotes), not bar (without quotes).
if [ "$RUN_ENV" = "dev" ] || [ "$RUN_ENV" = "\"dev\"" ] ;then 
  PORT="$FRONTEND_PORT" npm run dev; 
else 
  npm run build 
  PORT="$FRONTEND_PORT" npm run start; 
fi
