const { createGame } = require('../helpers/createGame.js');

const Emojis = {
  ThumbsUp: '👍',
  Rocket: '🚀',
  Stop: '🛑',
  NotLeader: '🙅',
};

module.exports = {
  name: 'play',
  description: 'Starts a new game of treachery.',
  async execute(environment, message, args) {
    const readyUserIds = new Set();
    const notLeaderUserIds = new Set();

    const createSetupMessage = () => ({
      embed: {
        title: 'Treachery Game Setup',
        description:
          `Click ${Emojis.ThumbsUp} to join this game.\n` +
          `Click ${Emojis.Rocket} to start this game.\n` +
          `Click ${Emojis.NotLeader} if you don't want to be the leader.\n` +
          `Click ${Emojis.Stop} to cancel this game.`,
        fields: readyUserIds.size
          ? [
              {
                name: 'Ready Players',
                value: [...readyUserIds]
                  .map(
                    (userId) =>
                      `<@${userId}>` +
                      (notLeaderUserIds.has(userId) ? ' (not leader)' : '')
                  )
                  .join('\n'),
              },
            ]
          : [],
      },
    });

    const setupMessage = await message.channel.send(createSetupMessage());

    setupMessage.react(Emojis.ThumbsUp);
    setupMessage.react(Emojis.Rocket);
    setupMessage.react(Emojis.NotLeader);
    setupMessage.react(Emojis.Stop);

    const collector = setupMessage.createReactionCollector(
      (reaction, user) => user.id != setupMessage.author.id,
      { idle: 300000, dispose: true }
    );

    collector.on('collect', (reaction, user) => {
      switch (reaction.emoji.name) {
        case Emojis.ThumbsUp:
          readyUserIds.add(user.id);
          setupMessage.edit(createSetupMessage());
          break;
        case Emojis.Rocket:
          collector.stop();
          createGame(environment, {
            channel: message.channel,
            actor: user,
            playerIds: [...readyUserIds],
            notLeaderPlayerIds: notLeaderUserIds,
          }).catch((error) => {
            console.error('Failed to start game with error:', error);
            message.channel.send({
              embed: {
                title: 'Failed To Start Game',
                description: error.toString(),
              },
            });
          });
          break;
        case Emojis.NotLeader:
          notLeaderUserIds.add(user.id);
          setupMessage.edit(createSetupMessage());
          break;
        case Emojis.Stop:
          collector.stop();
          message.channel.send({
            embed: {
              title: 'Treachery Game Cancelled',
              description: `The game was cancelled by ${user.tag}`,
            },
          });
          break;
      }
    });

    collector.on('remove', (reaction, user) => {
      switch (reaction.emoji.name) {
        case Emojis.ThumbsUp:
          readyUserIds.delete(user.id);
          setupMessage.edit(createSetupMessage());
          break;
        case Emojis.NotLeader:
          notLeaderUserIds.delete(user.id);
          setupMessage.edit(createSetupMessage());
          break;
      }
    });
  },
};
