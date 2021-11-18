#!/bin/bash
set -e

echo -e "\033[1;34m====================== Setting Up DB =======================\e[0m\n"

# Wait for the DB to start accepting connections.
for i in $(seq 5); do
    sleep 10
    echo -e "\033[1;33m Attempt $i \e[0m"
    npm run prisma:start_setup && npm run prisma:test_setup && break
done

echo -e "\033[1;32m======================== Setup Done ========================\e[0m\n"

echo -e "\033[1;34m==================== Running Application ===================\e[0m"

npm run start:dev