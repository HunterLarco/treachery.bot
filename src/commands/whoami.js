const abilityHelpers = require('../helpers/ability.js');

async function replyNotInAGame(interaction) {
  await interaction.editReply({
    embed: {
      title: 'Who Are You?',
      description: `<@${interaction.user.id}>, you are not currently in a game.`,
    },
    ephemeral: true,
  });
}

module.exports = {
  name: 'whoami',
  description: 'Privately messages you your current role.',
  async execute(environment, interaction) {
    await interaction.deferReply({ ephemeral: true });

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
      embeds: [abilityHelpers.createEmbed(ability)],
      ephemeral: true,
    });
  },
};
