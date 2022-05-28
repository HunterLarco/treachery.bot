const { createGame, FAKE_USER_ID } = require('../helpers/createGame.js');

module.exports = {
  name: 'fakegame',
  description: 'Starts a new game of treachery with fake players.',
  async execute(environment, message, args) {
    await createGame(environment, {
      channel: message.channel,
      actor: message.author,
      playerIds: [message.author.id, FAKE_USER_ID, FAKE_USER_ID, FAKE_USER_ID],
      notLeaderPlayerIds: new Set(),
    });
  },
};
