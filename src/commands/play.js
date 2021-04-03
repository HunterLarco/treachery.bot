const { v4: uuidv4 } = require('uuid');

const abilityHelpers = require('../helpers/ability.js');
const userHelpers = require('../helpers/users.js');

const Emojis = {
  ThumbsUp: '👍',
  Rocket: '🚀',
  Stop: '🛑',
  NotLeader: '🙅',
};

async function startGame(
  environment,
  channel,
  user,
  playerIds,
  notLeaderPlayers
) {
  if (playerIds.length < 4 || playerIds.length > 8) {
    channel.send({
      embed: {
        title: 'Treachery Failed To Start',
        description: 'Treachery requires 4-8 players.',
      },
    });
    return;
  }

  if (playerIds.lenth - notLeaderPlayers.size == 0) {
    channel.send({
      embed: {
        title: 'Treachery Failed To Start',
        description: 'At least one player must be willing to be the leader.',
      },
    });
    return;
  }

  const gameId = uuidv4();
  const game = {
    users: new Map(),
    dateCreated: new Date(),
  };

  const users = await userHelpers.fetchAll(environment, playerIds);

  await channel.send({
    embed: {
      title: 'Treachery Game Starting!',
      description:
        `The game has been started by ${user.tag}. All of the ` +
        'below players will be privately messaged a role.',
      fields: [
        {
          name: 'Players',
          value: users.map((user) => `<@${user.id}>`).join('\n'),
        },
        {
          name: 'Distribution',
          value:
            'In this game there is ' +
            abilityHelpers.distributionText(users.length),
        },
      ],
    },
  });

  for (const { user, ability } of abilityHelpers.assign(users, {
    notLeader: notLeaderPlayers,
  })) {
    game.users.set(user.id, { ability });
    environment.state.usersToGame.set(user.id, gameId);
    user.send(abilityHelpers.createEmbed(ability));

    if (ability.types.subtype == 'Leader') {
      channel.send(
        abilityHelpers.createEmbed(ability, {
          name: user.tag,
        })
      );
    }
  }

  environment.state.games.set(gameId, game);
}

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
          startGame(
            environment,
            message.channel,
            user,
            [...readyUserIds],
            notLeaderUserIds
          );
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
