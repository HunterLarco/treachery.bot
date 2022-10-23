const abilityHelpers = require('../helpers/ability.js');

async function replyNotInAGame(interaction) {
  await interaction.editReply({
    embed: {
      title: 'Nothing To Reveal',
      description: `<@${interaction.user.id}>, you are not currently in a game.`,
    },
  });
}

module.exports = {
  name: 'unveil',
  alias: ['reveal'],
  description: 'Reveals your current role to the channel.',
  async execute(environment, interaction) {
    await interaction.deferReply();

    const user = await environment.db.Users.get({
      userId: interaction.user.id,
    });

    if (!user || !user.currentGame) {
      await replyNotInAGame(interaction);
      return;
    }

    const game = await environment.db.Games.get({ key: user.currentGame });
    if (!game) {
      await replyNotInAGame(interaction);
      return;
    }

    const { ability } = game.players.find(
      (player) => player.userId == interaction.user.id
    );

    await interaction.editReply({
      embeds: [
        abilityHelpers.createEmbed(ability, {
          name: interaction.user.username,
        }),
      ],
    });
  },
};
