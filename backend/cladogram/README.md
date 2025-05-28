# CS3099 Group23 Cladogram - Backend

## Introduction

This is a web api that allows a user to retrieve taxonomic data in the form of a cladogram. A cladogram is a diagram used in cladistics to show relations among organisms. It is a tree-like diagram that shows the most probable sequence of divergence in clades.

See the [frontend cladogram README](../../frontend/src/components/Tree/README.md) for more information on the frontend.

### Cladogram API

The Cladogram API is found in the `backend/cladogram` directory, running at `/cladogram`. The API is used to deliever static image files, json files and create a json data structure for the frontend to use based on the given classification and root node.

When not in use data is serialised and stored in the `backend/cladogram/data` directory. This data is used to create the json data structure for the frontend to use.

### Database builder

The classifications this application is built around are stored in json files and downloaded at program startup. These files contain the published classifications in the json format that our application uses. The python script `backend/cladogram/update_classifications.py` uses these files to create a tree using a python class. Once every 24 hours the script will check to see what genus and species are known to belong under the published classifications taxon ranks store the updated tree in the `backend/cladogram/data` directory. This is done using the [Paleobiology Database](https://paleobiodb.org/#/). The script then uses the taxon names in the tree and tries to identify the corresponding wikidata qnumbers, allowing us to link to other visualisations.

Performing this process can take a long time, as we have to use sleep timers to avoid rate limiting on both the Paleobiology Database and Wikidata. The script is designed to be run in the background and will update the database every 24 hours.

## Installation

In order to prevent large blob files from being stored in the repository, the Search teams neo4j instance, our json files and images are stored on the `cs3099usersg2.teaching.cs.st-andrews.ac.uk` server. The bash script `./start-with-new-db.sh` is used to download the necessary files and create the required containers. This script is found in the root directory of the repository. From there, the application can be started using the `docker-compose up` command or the `podman-compose up` command.

```bash
cp env_example .env
./start-with-new-db.sh
docker compose up
```

```bash
cp env_example .env
./start-with-new-db.sh
podman-compose up
```

Assuming the user does not modify the `.env` file, the application will be available at `http://localhost:8080`. The site is already hosted on the server, so the user can access the site by visiting `cs3099user23.teaching.cs.st-andrews.ac.uk`.

A longer explanation of the installation process can be found in the [dev notes README](../../../../docs/dev-environment.md).
