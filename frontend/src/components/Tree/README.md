# CS3099 Group23 Cladogram - Frontend

## Introduction

This is a web application that allows users view and interact with cladograms through different tree types. A cladogram is a diagram used in cladistics to show relations among organisms. It is a tree-like diagram that shows the most probable sequence of divergence in clades.

See the [backend cladogram README](../../../../backend/cladogram/README.md) for more information on the backend.

### TreePage

The TreePage component is found in the `frontend/src/components/Tree/TreePage.js` file. This implementation uses context to manage the state of the tree and the dataset. The context provider is found in the `frontend/src/store/TreeContext.js` file. The TreePage component is responsible for rendering the linear and radial tree representations of the dataset. Each component and subcomponent is stored in the surrounding directory with the CSS stored in modules with corresponding names.

### Cladogram Widget

The Cladogram widget is a reusable component that can be used to display a cladogram on the search page. It is found in the `frontend/src/components/Tree/Widget` directory. The widget is responsible for rendering a summary of a given portion of the tree, displaying the parent, sibling, and child nodes of the selected node. Each component and subcomponent is stored in the surrounding directory with the CSS stored in modules with corresponding names.

### Shared Components

As a group we created a number of shared components that are used throughout the application allowing for a consistent look and feel. These components are found in the `frontend/src/components/UI` directory.

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
