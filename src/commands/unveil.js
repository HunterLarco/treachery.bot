const abilityHelpers = require('../helpers/ability.js');

function replyNotInAGame(message) {
  message.channel.send({
    embed: {
      title: 'Nothing To Reveal',
      description: `<@${message.author.id}>, you are not currently in a game.`,
    },
  });
}

module.exports = {
  name: 'unveil',
  alias: ['reveal'],
  description: 'Reveals your current role to the channel.',
  async execute(environment, message, args) {
    const user = await environment.db.Users.get({ userId: message.author.id });

    if (!user || !user.currentGame) {
      replyNotInAGame(message);
      return;
    }

    const game = await environment.db.Games.get({ key: user.currentGame });
    if (!game) {
      replyNotInAGame(message);
      return;
    }

    const { ability } = game.players.find(
      (player) => player.userId == message.author.id
    );

    message.channel.send(
      abilityHelpers.createEmbed(ability, {
        name: message.author.username,
      })
    );
  },
};
