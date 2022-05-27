const createGame = require('../helpers/createGame.js');

function replyNoPreviousGame(message) {
  message.channel.send({
    embed: {
      title: 'Failed To Start Game',
      description: `<@${message.author.id}>, you are not currently in a game.`,
    },
  });
}

module.exports = {
  name: 'playagain',
  description:
    'Starts a new game of treachery with the same players as your last game.',
  async execute(environment, message, args) {
    const user = await environment.db.Users.get({ userId: message.author.id });
    if (!user) {
      replyNoPreviousGame(message);
      return;
    }

    const game = await environment.db.Games.get({ key: user.currentGame });
    if (!game) {
      replyNoPreviousGame(message);
      return;
    }

    await createGame(environment, {
      channel: message.channel,
      actor: message.author,
      playerIds: game.players.map((player) => player.userId),
      notLeaderPlayerIds: game.players
        .filter((player) => player.ability.types.subtype == 'Leader')
        .map((player) => player.userId),
    });
  },
};
