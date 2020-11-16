const abilityHelpers = require('../helpers/ability.js');

module.exports = {
  name: 'whoami',
  description: 'Privately messages you your current role.',
  execute(environment, message, args) {
    if (!environment.state.usersToGame.has(message.author.id)) {
      message.channel.send({
        embed: {
          title: 'Who Are You?',
          description: `${message.author.tag}, you are not currently in a game.`,
        },
      });
      return;
    }

    const { ability } = environment.state.games
      .get(environment.state.usersToGame.get(message.author.id))
      .users.get(message.author.id);

    message.channel.send({
      embed: {
        title: 'Who Are You?',
        description: `${message.author.tag}, you have been privately messaged.`,
      },
    });

    message.author.send(abilityHelpers.createEmbed(ability));
  },
};
