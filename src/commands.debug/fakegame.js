const { createGame } = require('../helpers/createGame.js');
const { generateGameStartedEmbed } = require('../embeds/gameStarted.js');
const { FAKE_USER_ID } = require('../data/fakeUserId.js');

module.exports = {
  name: 'fakegame',
  description: 'Starts a new game of treachery with fake players.',
  async execute(environment, interaction) {
    await interaction.reply({
      embeds: [
        generateGameStartedEmbed(interaction.user.id, [
          interaction.user.id,
          FAKE_USER_ID,
          FAKE_USER_ID,
          FAKE_USER_ID,
        ]),
      ],
    }),
      await createGame(environment, {
        interaction,
        actor: interaction.user,
        playerIds: [
          interaction.user.id,
          FAKE_USER_ID,
          FAKE_USER_ID,
          FAKE_USER_ID,
        ],
        notLeaderPlayerIds: new Set(),
      });
  },
};
