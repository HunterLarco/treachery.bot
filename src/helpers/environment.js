const Discord = require('discord.js');
const express = require('express');
const path = require('path');

const commandHelpers = require('./commands.js');

async function create() {
  const config = {
    healthcheck_port: process.env.HEALTHCHECK_PORT || 3000,
    bot_prefix: process.env.BOT_PREFIX || '~',
    bot_token: process.env.BOT_TOKEN,
  };

  if (!config.bot_token) {
    throw 'Env variable BOT_TOKEN must be specified.';
  }

  return {
    config,

    client: new Discord.Client(),

    server: express(),

    commands: await commandHelpers.loadFromDirectory(
      path.join(__dirname, '../commands/')
    ),

    state: {
      // Map<string, {
      //   users: Object<id, {
      //     ability: Ability,
      //   }>,
      //   dateCreated: Date,
      // }>
      games: new Map(),

      // Maps from user id to game id.
      //
      // Map<string, string>
      usersToGame: new Map(),
    },
  };
}

module.exports = {
  create,
};
