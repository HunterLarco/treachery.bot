const dynamoose = require('dynamoose');
const { v4: uuidv4 } = require('uuid');

const abilityHelpers = require('./ability.js');
const userHelpers = require('./users.js');

async function createGame(
  environment,
  { channel, actor, playerIds, notLeaderPlayerIds }
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

  if (playerIds.length - notLeaderPlayerIds.size == 0) {
    channel.send({
      embed: {
        title: 'Treachery Failed To Start',
        description: 'At least one player must be willing to be the leader.',
      },
    });
    return;
  }

  // Create the `Game` database item.

  const game = {
    key: uuidv4(),
    players: [],
    startTime: new Date(),
    // Automatically cleanup games older than 30 days.
    expiration: Math.round(Date.now() / 1000) + 30 * 24 * 60 * 60,
  };

  for await (const { userId, ability } of abilityHelpers.assign(playerIds, {
    notLeader: notLeaderPlayerIds,
  })) {
    game.players.push({
      userId: user.id,
      ability,
    });
  }

  // Write the game database item and update all players' current game.

  const transaction = [environment.db.Games.transaction.create(game)];
  for (const userId of playerIds) {
    transaction.push(
      environment.db.Users.transaction.update(
        { userId },
        { currentGame: game.key }
      )
    );
  }
  await dynamoose.transaction(transaction);

  // Once all of the db commands are executed successfully, notify all of the
  // players that the game has begun.

  const users = await userHelpers.fetchAll(environment, playerIds);

  await channel.send({
    embed: {
      title: 'Treachery Game Starting!',
      description:
        `The game has been started by <@${actor.id}>. All of the ` +
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

  for (const user of users) {
    const ability = game.players.find(({ userId }) => userId == user.id)
      .ability;

    user.send(abilityHelpers.createEmbed(ability));

    if (ability.types.subtype == 'Leader') {
      channel.send(
        abilityHelpers.createEmbed(ability, {
          name: user.username,
        })
      );
    }
  }
}

module.exports = { createGame };
