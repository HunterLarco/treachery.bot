FROM node:14.1.0
ENV NODE_ENV=production

ADD src /bot
COPY package.json /bot
COPY package-lock.json /bot

WORKDIR /bot

RUN npm install --production

ARG BOT_TOKEN
ENV BOT_TOKEN $BOT_TOKEN

CMD ["node", "index.js"]
