#!/bin/bash

DB_NAME=${DB_NAME:-latest}
DUMP_DIR="$HOME/db-dump/$DB_NAME"

# always run this script in this dir!
cd $(dirname $0)
cd ..

DUID=$(id -u) podman-compose stop

rm -rf "$DUMP_DIR"
mkdir -p "$DUMP_DIR"

podman run --interactive --tty --userns=keep-id --user $(id -u):$(id -u) --rm -v batchpipe:/data -v ${DUMP_DIR}:/backups:z neo4j/neo4j-admin:5.16.0 neo4j-admin database dump neo4j --to-path=/backups --overwrite-destination=true

cd "$DUMP_DIR"; zip "../$DB_NAME.zip" *
cd - 
DUID=$(id -u) COMPOSE_PROFILES=batchpipe podman-compose start
