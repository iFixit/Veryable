#!/bin/sh

set -e

docker exec -it veryable-app npm run test || \
printf "\033[1;31m============= Error running tests in Docker Container ====================\n"