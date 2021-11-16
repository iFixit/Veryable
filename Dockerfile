FROM node:14-alpine

## Create app directory
WORKDIR /app

## A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

## Install dependencies without executing pre and post scripts
# Basically meant to disable husky and prisma post-install in docker
RUN npm ci --ignore-scripts && npx prisma generate

COPY . .
