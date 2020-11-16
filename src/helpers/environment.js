const Discord = require('discord.js');
const path = require('path');

const commandHelpers = require('./commands.js');

async function create() {
  return {
    client: new Discord.Client(),

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
