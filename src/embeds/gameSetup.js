const { EmbedBuilder } = require('discord.js');

function generatePlayerList(readyPlayerInfo) {
  return readyPlayerInfo
    .map(({ id, labels }) =>
      labels.length ? `<@${id}> (${labels.join(', ')})` : `<@${id}>`
    )
    .join('\n');
}

/**
 * @param Array<{id: string, labels?: [string]}> readyPlayerInfos
 */
function generateGameSetupEmbed(readyPlayerInfos) {
  const embed = new EmbedBuilder().setTitle('Treachery Game Setup');

  if (readyPlayerInfos.length) {
    embed.addFields({
      name: 'Ready Players',
      value: generatePlayerList(readyPlayerInfos),
    });
  }

  return embed;
}

function generateCanceledGameEmbed(actorId) {
  return new EmbedBuilder()
    .setTitle('Treachery Game Canceled')
    .setDescription(`Game canceled by <@${actorId}>.`);
}

module.exports = {
  generateGameSetupEmbed,
  generateCanceledGameEmbed,
};