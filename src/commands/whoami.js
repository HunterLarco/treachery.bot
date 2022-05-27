const abilityHelpers = require('../helpers/ability.js');

function replyNotInAGame(message) {
  message.channel.send({
    embed: {
      title: 'Who Are You?',
      description: `<@${message.author.id}>, you are not currently in a game.`,
    },
  });
}

module.exports = {
  name: 'whoami',
  description: 'Privately messages you your current role.',
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

    message.channel.send({
      embed: {
        title: 'Who Are You?',
        description: `${message.author.tag}, you have been privately messaged.`,
      },
    });

    message.author.send(abilityHelpers.createEmbed(ability));
  },
};
