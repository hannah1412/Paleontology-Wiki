# Development Envrionment

This document describes how to run the supergroup project locally.

## Setup Steps

*Note: on Lab machines, replace `docker compose` with `podman-compose`*

1. Ensure you are either on MacOS or Linux. Windows users use WSL or lab machines!

2. Ensure that you have ssh access to the supergroup user: 

    To check this, run:
    ```sh
    ssh cs3099usersg2@cs3099usersg2.teaching.cs.st-andrews.ac.uk echo 'Success!!'
    ```

    If this is not setup, go to [Accessing the Supergroup user over SSH.](#accessing-the-supergroup-user-over-ssh)

3. Ensure that you have [Docker Compose](https://www.docker.com/) installed:

    ```sh
    docker compose --version
    ```

    If you are on a lab machine, `podman-compose` is already installed and
    replaces `docker compose`.

4. 
    a. To develop the G24 DB generation batchpipe, see [Batchpipe](#batchpipe).

    b. If this is the first time running the project on your machine, or want to reset the project with the latest database version, follow [First Time Setup.](#first-time-setup)

    c. Otherwise, follow [Starting and Stopping the Project Containers.](#starting-and-stopping-the-project-containers)

5. [Accessing the Running Project.](#accessing-the-running-project)

# First Time Setup

1. Copy `env_example` to `.env`. Read through `.env`, and modify if necessary. 
2. Run `./start-with-new-db.sh` to download the database image, load it, and
   start the project.

3. To stop or restart the project, see [Starting and Stopping the Project Containers.](#starting-and-stopping-the-project-containers)

# Accessing the Supergroup user over SSH.

First, ensure all your ssh keys are on Gitlab - these instructions use Gitlab to
download your keys.

```sh
# ssh into your user on the 3099 users host server.
ssh <your_user_name>@cs3099usersg2.teaching.cs.st-andrews.ac.uk

# change user to cs3099usersg2
sudo -u cs3099usersg2 bash -l

# add your ssh keys from gitlab:
curl https://gitlab.cs.st-andrews.ac.uk/<your_user_name>.keys >> ~/.ssh/authorized_keys

# disconnect from ssh
exit
exit

# try to log in directly
ssh cs3099usersg2@cs3099usersg2.teaching.cs.st-andrews.ac.uk echo 'Success!!'
```

# Accessing The Running Project

Values beginning with $ are defined in the `.env` file.

* The frontend can be found at: `localhost:$FRONTEND_PORT`.

* The backend can be found at: `$BACKEND_ADDR`.

* The Neo4j database UI can be found at: `http://localhost:$G24_DB_HTTP`. 
  Login with the user `neo4j` and password `$G24_DB_PASSWORD`.

* The Neo4j database can be queried via bolt at
  `bolt://localhost:$G24_DB_BOLT`. 

**Note: on some machines, docker containers are accessible through 0.0.0.0 instead of localhost.**


# Batchpipe

1. Ensure that you have set the environment variables in `.env`.
2. If running the app for the first time, run: 

    ```
    docker volume rm batchpipe
    docker volume create batchpipe
    DUID=$(id -u) COMPOSE_PROFILES=batchpipe ./start-with-new-db.sh
    ```

    This creates a new production DB from backup, and runs the optional
    batchpipe container. **Note that batchpipe and the app have seperate databases.**
 
3. For existing setups: 
    * To start the project, do `COMPOSE_PROFILES=batchpipe DUID=$(id -u) docker compose up --build`
    * To start the project in the background, do `COMPOSE_PROFILES=batchpipe DUID=$(id -u) docker compose up --build -d`
    * To stop the project, do `COMPOSE_PROFILES=batchpipe docker compose down`

* If the `sg2-pipeline` container crashes due to memory issues, you will need to adjust the memory amounts listed in compose.yml.
  Running the following command will tell you the amounts to use (replacing 16g with your available memory):

  ```
  docker run --rm neo4j neo4j-admin server memory-recommendation --memory=16g --docker
  ```

* The Neo4j database UI can be found at: `http://localhost:$BATCHPIPE_DB_HTTP`. 
  Login with the user `neo4j` and password `$BATCHPIPE_DB_PASSWORD`.

# Starting and Stopping the Project Containers.

* To start the project, do `docker compose up --build`
* To start the project in the background, do `docker compose up --build -d`
* To stop the project, do `docker compose down`

# Useful bits 

- Both docker and your local machine use the same node_modules folder. If
  running on either breaks due to `npm` issues, consider deleting it and
  reinstalling node packages using `npm install`.

- If you need to delete the database, stop the containers, then run `docker
  volume rm sg2_g24db-data`.

- If you work mainly on lab machines, do `podman-compose` there and then use
[SSH Port forwarding](https://phoenixnap.com/kb/ssh-port-forwarding) to bring
the remote localhost to you. If you are on the host servers (as opposed to a
lab machine), you will almost certainly need to change the ports in .env as the
defaults are really common.

<!-- 
vim: cc=80
-->
