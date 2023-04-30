import * as discord from 'discord.js';
import * as express from 'express';
import * as path from 'path';

import * as commandHelpers from '@/helpers/commands';
import * as dynamoClient from '@/helpers/dynamodb';

export async function create() {
  const config = {
    healthcheck_port: process.env.HEALTHCHECK_PORT || 3000,
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
      client: new discord.Client({
        intents: [discord.GatewayIntentBits.Guilds],
      }),
      rest: new discord.REST({ version: '10' }).setToken(config.bot_token),
    },

    server: express.default(),

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
