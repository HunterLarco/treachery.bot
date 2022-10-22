const Discord = require('discord.js');
const express = require('express');
const path = require('path');

const commandHelpers = require('./commands.js');
const dynamoClient = require('./dynamodb.js');

async function create() {
  const config = {
    healthcheck_port: process.env.HEALTHCHECK_PORT || 3000,
    bot_prefix: process.env.BOT_PREFIX || '~',
    bot_token: process.env.BOT_TOKEN,
    bot_client_id: process.env.BOT_CLIENT_ID,
    debug: !!process.env.DEBUG,
  };

  if (!config.bot_token) {
    throw 'Env variable BOT_TOKEN must be specified.';
  }

  return {
    config,

    discord: {
      client: new Discord.Client({
        intents: [Discord.GatewayIntentBits.Guilds],
      }),
      rest: new Discord.REST({ version: '10' }).setToken(config.bot_token),
    },

    server: express(),

    db: dynamoClient,

    commands: [
      ...(await commandHelpers.loadFromDirectory(
        path.join(__dirname, '../commands/')
      )),
      ...(config.debug
        ? await commandHelpers.loadFromDirectory(
            path.join(__dirname, '../commands.debug/')
          )
        : []),
    ],
  };
}

module.exports = {
  create,
};
