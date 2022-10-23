const { EmbedBuilder } = require('discord.js');

function generatePlayerList(readyPlayerInfo) {
  const rows = readyPlayerInfo.map(({ id, labels }) =>
    labels.length ? `<@${id}> (${labels.join(', ')})` : `<@${id}>`
  );

  for (let i = rows.length; i < 4; ++i) {
    rows.push('<waiting>');
  }

  return rows.join('\n');
}

/**
 * @param Array<{id: string, labels?: [string]}> readyPlayerInfos
 */
function generateGameSetupEmbed(readyPlayerInfos) {
  const embed = new EmbedBuilder()
    .setTitle('Treachery Game Setup')
    .setDescription('A treachery game is starting! Join the game to play.');

  if (readyPlayerInfos.length < 4) {
    const neededPlayers = 4 - readyPlayerInfos.length;
    embed.setFooter({
      text: `${neededPlayers} more player${
        neededPlayers > 1 ? 's' : ''
      } required to start the game.`,
    });
  }

  embed.addFields({
    name: 'Ready Players',
    value: generatePlayerList(readyPlayerInfos),
  });

  return embed;
}

module.exports = {
  generateGameSetupEmbed,
};
