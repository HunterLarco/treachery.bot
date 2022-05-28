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
    debug: !!process.env.DEBUG,
  };

  if (!config.bot_token) {
    throw 'Env variable BOT_TOKEN must be specified.';
  }

  return {
    config,

    client: new Discord.Client(),

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
