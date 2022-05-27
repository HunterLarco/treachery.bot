const abilityHelpers = require('../helpers/ability.js');

module.exports = {
  name: 'whoami',
  description: 'Privately messages you your current role.',
  async execute(environment, message, args) {
    const user = await environment.db.Users.get({ userId: message.author.id });

    if (!user || !user.currentGame) {
      message.channel.send({
        embed: {
          title: 'Who Are You?',
          description: `${message.author.tag}, you are not currently in a game.`,
        },
      });
      return;
    }

    const game = await environment.db.Games.get({ key: user.currentGame });
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
