const { EmbedBuilder } = require('discord.js');

const abilityHelpers = require('../helpers/ability.js');
const { FAKE_USER_ID } = require('../data/fakeUserId.js');

function generateDistributionText(numPlayers) {
  const counts = abilityHelpers.distribution(numPlayers);

  return [
    `1 leader`,
    `${counts.traitor} traitor` + (counts.traitor > 1 ? 's' : ''),
    `${counts.assassin} assassin` + (counts.assassin > 1 ? 's' : ''),
    `${counts.guardian} guardian` + (counts.guardian > 1 ? 's' : ''),
  ].join('\n');
}

function generatePlayerList(playerIds) {
  return playerIds
    .map((id) => (id == FAKE_USER_ID ? `{Fake User}` : `<@${id}>`))
    .join('\n');
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
      value: generatePlayerList(playerIds),
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
  generateGameStartedEmbed,
};
