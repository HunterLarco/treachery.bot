const { EmbedBuilder } = require('discord.js');

function generateCanceledGameEmbed(actorId) {
  return new EmbedBuilder()
    .setTitle('Treachery Game Canceled')
    .setDescription(`Game canceled by <@${actorId}>.`);
}

module.exports = {
  generateCanceledGameEmbed,
};
