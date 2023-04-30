import * as dynamoose from 'dynamoose';
import * as uuid from 'uuid';

import * as abilityHelpers from '@/helpers/ability';
import { FAKE_USER_ID } from '@/data/fakeUserId';

export async function createGame(
  environment: any,
  {
    playerIds,
    notLeaderPlayerIds,
  }: {
    playerIds: Array<string | typeof FAKE_USER_ID>;
    notLeaderPlayerIds: Set<string | typeof FAKE_USER_ID>;
  }
) {
  if (playerIds.length < 4 || playerIds.length > 8) {
    throw 'Treachery requires 4-8 players.';
  } else if (playerIds.length == notLeaderPlayerIds.size) {
    throw 'At least one player must be willing to be the leader.';
  }

  /// Create the `Game` database item.

  const game = {
    key: uuid.v4(),
    players: [] as Array<any>,
    startTime: new Date(),
    // Automatically cleanup games older than 30 days.
    expiration: Math.round(Date.now() / 1000) + 30 * 24 * 60 * 60,
  };

  const players = [];
  for await (const { userId, ability } of abilityHelpers.assign(playerIds, {
    notLeader: notLeaderPlayerIds,
  })) {
    players.push({ userId, ability });

    if (userId === FAKE_USER_ID) {
      continue;
    }

    game.players.push({
      userId,
      ability,
    });
  }

  /// Write the game database item and update all players' current game.

  const transaction = [environment.db.Games.transaction.create(game)];
  for (const userId of playerIds) {
    if (userId == FAKE_USER_ID) {
      continue;
    }

    transaction.push(
      environment.db.Users.transaction.update(
        { userId },
        { currentGame: game.key }
      )
    );
  }
  await dynamoose.transaction(transaction);

  /// Once all of the db commands are executed successfully, return the ability assignments.

  return {
    abilities: players,
  };
}
