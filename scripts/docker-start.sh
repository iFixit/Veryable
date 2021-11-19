#!/bin/sh

set -ex

docker-compose --env-file=.env.dev build --force-rm
docker-compose --env-file=.env.dev up --detach