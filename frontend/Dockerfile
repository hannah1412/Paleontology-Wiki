# USE ME THROUGH COMPOSE ONLY!!!

FROM node:20

RUN mkdir -p /workspace
WORKDIR /workspace/frontend
# the aim is to mount code (for live reloading) while still having a fresh node_modules in the container.
COPY ./frontend/package.json package.json 
COPY ./frontend/docker-entrypoint.sh docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh
RUN npm install

ENTRYPOINT "./docker-entrypoint.sh"
