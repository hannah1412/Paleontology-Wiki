TODO Update

# Running on the host servers.

1. Ensure you can ssh directly into cs3099usersg2. Ssh into cs3099usersg2.
2. Update the git repository in ~/repo if necessary.
3. cd ~/repo
4. Create an env file from the example if it does not already exist. 
5. Start / restart docker containers using podman-compose down / podman-compose up.
6. Is the luigi central scheduler running? Check if https://cs3099usersg2.teaching.cs.st-andrews.ac.uk/luigi/ is reachable. If not, follow *Setting Up Luigid* first.
7. go to ~/repo/batchpipe/infra and run ./run-pipeline.sh. 

This runs itself in a tmux container in a temporary directory that contains a freshly cloned copy of the main branch of this repo.

## Setting up Luigid
 
1. Copy the luigi.conf file in this folder to ~/luigid
2. Run ./run-luigid.sh.

Note that this runs itself in a tmux container.
