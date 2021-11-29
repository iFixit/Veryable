#!/bin/sh
set -e

printf "\033[1;34m====================== Setting Up DB =======================\e[0m\n"

# Wait for the DB to start accepting connections.
for i in 1 .. 5; do
    sleep 10
    printf "\033[1;33m Attempt %s \e[0m" "$i"
    npm run prisma:start_setup && npm run prisma:test_setup && break
done

printf "\033[1;32m======================== Setup Done ========================\e[0m\n"

printf "\033[1;34m==================== Running Application ===================\e[0m"

npm run start:dev