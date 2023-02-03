FROM node:18-alpine

WORKDIR /app
COPY package*.json /app/

RUN npm ci
RUN npm prune --production

COPY . /app/

EXPOSE 80

ENV NODE_ENV=production

CMD [ "npm", "start" ]