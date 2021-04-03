const abilityHelpers = require('../helpers/ability.js');

module.exports = {
  name: 'unveil',
  alias: ['reveal'],
  description: 'Reveals your current role to the channel.',
  execute(environment, message, args) {
    if (!environment.state.usersToGame.has(message.author.id)) {
      message.channel.send({
        embed: {
          title: 'Nothing To Reveal',
          description: `<@${message.author.id}>, you are not currently in a game.`,
        },
      });
      return;
    }

    const { ability } = environment.state.games
      .get(environment.state.usersToGame.get(message.author.id))
      .users.get(message.author.id);

    message.channel.send(
      abilityHelpers.createEmbed(ability, {
        name: `<@${message.author.id}>`,
      })
    );
  },
};
