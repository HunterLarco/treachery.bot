FROM node:14.1.0
ENV NODE_ENV=production

ADD src /bot
COPY package.json /bot
COPY package-lock.json /bot

WORKDIR /bot

RUN npm install --production

CMD ["node", "index.js"]
