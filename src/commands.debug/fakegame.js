const { createGame, FAKE_USER_ID } = require('../helpers/createGame.js');

module.exports = {
  name: 'fakegame',
  description: 'Starts a new game of treachery with fake players.',
  async execute(environment, interaction) {
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
