# Batchpipe

`batchpipe` is the data injestion and analytics pipeline for search.

*Used and developed by Group 24.*

**Contact:** Niklas Dewally <nd60@st-andrews.ac.uk>

## Starting Development

### Installation

First, ensure you have a working copy of [pandoc](https://pandoc.org/) on your system.

We use [Poetry](https://python-poetry.org/) to manage the dependencies of this
project. 

1. Install Poetry. Do not use `pip`, use the [official installer](https://python-poetry.org/docs/#installing-with-the-official-installer) or your package manager.
2. If on a lab machine, do `poetry env use /usr/local/python/bin/python3.11`.
3. Run `poetry install` to install the dependencies for the project.
4. Run `poetry shell` to enter a virtual environment for the project.

### Project Structure

`batchpipe` is a Python package, located in `src/batchpipe`.

* Tasks should be added to the `batchpipe.tasks` sub-package.

* `poetry shell` adds `batchpipe` to the environment, so it can be imported and
   ran like any other package :)


### Running Locally

1. Create and customise a `.env` file at the root of the git repository.
2. Ensure that `docker compose` is running.

To run a task and all its dependencies:

```sh
luigi --local-scheduler --module batchpipe.tasks InitDBFromWikidataJson
```

Alternatively, run things in parallel and watch the progress on the web portal (localhost:8082):

```sh
mkdir -p var/log
luigid --background --pidfile var/pid --logdir var/log --state-path var/state
luigi --workers 5 --module batchpipe.tasks InitDBFromWikidataJson
```

I reccomend you create a folder just for the data this generates, and use that
same folder every time you run it. This will allow batchpipe to cache things
and not run everything every time. If you wish to clean build things, or have
deleted the database (**including moving lab machines**), delete this folder,
recreate it, and rerun.

<!--
vim:cc=80
-->
