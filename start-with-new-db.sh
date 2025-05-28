#!/bin/bash
# vim: wrap!

DB_NAME=${DB_NAME:-latest}

if [ ! -f .env ]; then
  echo "No .env file found!"
  exit 1
fi

while true; do
    read -p "Do you use docker compose or podman-compose? Type d or p: " dp
    case $dp in
        [Dd]* ) COMPOSECMD="docker compose"; break ;;
        [Pp]* ) COMPOSECMD="podman-compose"; break ;;
        * ) echo "Please answer d or p";;
    esac
done


# always run in the repository root
cd $(dirname $0)



rm -rf dbimg
mkdir -p dbimg
scp cs3099usersg2@cs3099usersg2.teaching.cs.st-andrews.ac.uk:db-dump/${DB_NAME}.zip tmp.zip

unzip -d dbimg -o tmp.zip
rm -rf tmp.zip

rm -rf backend/cladogram/data
mkdir -p backend/cladogram/data
scp cs3099usersg2@cs3099usersg2.teaching.cs.st-andrews.ac.uk:static/classifications.zip tmp.zip
unzip -d backend/cladogram/data -o tmp.zip
rm -rf tmp.zip

rm -rf backend/cladogram/models
mkdir -p backend/cladogram/models
scp cs3099usersg2@cs3099usersg2.teaching.cs.st-andrews.ac.uk:static/3d.zip tmp.zip
unzip -d backend/cladogram/models -o tmp.zip
rm -rf tmp.zip

rm -rf backend/cladogram/images
mkdir -p backend/cladogram/images
scp cs3099usersg2@cs3099usersg2.teaching.cs.st-andrews.ac.uk:static/Images.zip tmp.zip
unzip -d backend/cladogram/images -o tmp.zip
rm -rf tmp.zip

echo "DESTROYING CONTAINERS AND VOLUMES"

eval "$COMPOSECMD down"
docker volume rm -f sg2_g24db-data
docker volume create sg2_g24db-data

# ensure batchpipe volume exists
docker volume create batchpipe 2>&1 1>/dev/null

if [ "${COMPOSE_PROFILES}" == "batchpipe" ]; then
  options=("Wipe database" "Use production DB image" "Keep existing (do nothing)")
  echo "How should I initialise the batchpipe database?"
  select opt in "${options[@]}"; do
    case $opt in 
      "Wipe database") 
        docker volume rm -f batchpipe
        docker volume create batchpipe
        break
        ;;
      "Keep existing (do nothing)")
        break
        ;;
      "Use production DB image")
            docker volume rm -f batchpipe
            docker volume create batchpipe
            if [[ ${COMPOSECMD}  == "podman-compose" ]]; then
              podman run --rm --userns=keep-id --user $(id -u) --interactive --tty -v batchpipe:/data -v ./dbimg:/backups:z neo4j/neo4j-admin:5.16.0 neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
            else
              docker run --rm --interactive --user $(id -u) --tty -v batchpipe:/data -v ./dbimg:/backups:z neo4j/neo4j-admin:5.16.0 neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
            fi
        break;
        ;;
      *)
        echo "Invalid option"
        ;;
    esac
  done
fi


echo "CREATING DATABASE FROM BACKUP"
if [[ ${COMPOSECMD}  == "podman-compose" ]]; then
  podman run --rm --userns=keep-id --user $(id -u) --interactive --tty -v sg2_g24db-data:/data -v ./dbimg:/backups:z neo4j/neo4j-admin:5.16.0 neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
else
  docker run --rm --interactive --user $(id -u) --tty -v sg2_g24db-data:/data -v ./dbimg:/backups:z neo4j/neo4j-admin:5.16.0 neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
fi

echo "REBUILDING AND STARTING CONTAINERS"
export DUID=${DUID-$(id -u)}
eval "$COMPOSECMD up -d"
