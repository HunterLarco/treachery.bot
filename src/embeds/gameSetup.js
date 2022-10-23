const { EmbedBuilder } = require('discord.js');

const abilityHelpers = require('../helpers/ability.js');

function generatePlayerList(readyPlayerInfo) {
  return readyPlayerInfo
    .map(({ id, labels }) =>
      labels.length ? `<@${id}> (${labels.join(', ')})` : `<@${id}>`
    )
    .join('\n');
}

function generateDistributionText(numPlayers) {
  const counts = abilityHelpers.distribution(numPlayers);

  return [
    `1 leader`,
    `${counts.traitor} traitor` + (counts.traitor > 1 ? 's' : ''),
    `${counts.assassin} assassin` + (counts.assassin > 1 ? 's' : ''),
    `${counts.guardian} guardian` + (counts.guardian > 1 ? 's' : ''),
  ].join('\n');
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

function generateGameStartedEmbed(actorId, playerIds) {
  const embed = new EmbedBuilder()
    .setTitle('Treachery Game Started!')
    .setDescription(
      `The game has been started by <@${actorId}> All of the below players ` +
        `will be privately messaged a role.`
    );

  if (playerIds.length) {
    embed.addFields({
      name: 'Ready Players',
      value: generatePlayerList(playerIds.map((id) => ({ id, labels: [] }))),
      inline: true,
    });
  }

  embed.addFields({
    name: 'Distribution',
    value: generateDistributionText(playerIds.length),
    inline: true,
  });

  return embed;
}

module.exports = {
  generateGameSetupEmbed,
  generateCanceledGameEmbed,
  generateGameStartedEmbed,
};
