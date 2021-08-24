FROM node:14

RUN mkdir -p /opt/veryable
WORKDIR /opt/veryable

COPY . /opt/veryable
RUN npm install

ENV NODE_ENV=prod

CMD ["npm","run","prod"]
