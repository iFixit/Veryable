FROM node:16-alpine

## Create app directory
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY prisma ./prisma/

## Install dependencies without executing pre and post scripts
# Basically meant to disable husky and prisma post-install in docker
RUN npm ci --ignore-scripts && npx prisma generate

COPY . .
