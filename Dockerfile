FROM node:16.9.0
ENV NODE_ENV=production

ADD . /bot
WORKDIR /bot

RUN npm install --production

ARG BOT_TOKEN
ENV BOT_TOKEN $BOT_TOKEN

ARG BOT_CLIENT_ID
ENV BOT_CLIENT_ID $BOT_CLIENT_ID

CMD ["node", "server.cjs"]
