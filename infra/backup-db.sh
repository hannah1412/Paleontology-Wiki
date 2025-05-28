#!/bin/bash

# always run this script in this dir!
cd $(dirname $0)
cd ..


podman-compose stop

rm -rf $HOME/db-dump/latest
mkdir -p $HOME/db-dump/latest

docker run --interactive --tty --rm -v sg2_g24db-data:/data -v $HOME/db-dump/latest:/backups neo4j/neo4j-admin:5.16.0 neo4j-admin database dump neo4j --to-path=/backups --overwrite-destination=true

cd $HOME/db-dump/latest; zip ../latest.zip *
cd - 
podman-compose start
