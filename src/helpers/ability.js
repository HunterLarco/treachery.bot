const pickRandom = require('pick-random');
const shuffleArray = require('shuffle-array');

const { IdentityDataSource } = require('../data/MTGTreacheryDataSource.js');

function distribution(players) {
  if (players < 4 || players > 8) {
    throw 'Treachery requires 4-8 players';
  }

  const counts = {
    leader: 1,
    traitor: 1,
    assassin: 2,
    guardian: 0,
  };

  if (players >= 8) {
    counts.traitor = 2;
  }

  if (players >= 6) {
    counts.assassin = 3;
  }

  if (players >= 7) {
    counts.guardian = 2;
  } else if (players >= 5) {
    counts.guardian = 1;
  }

  return counts;
}

async function* assign(userIds, { notLeader }) {
  const canBeLeader = userIds.filter((userId) => !notLeader.has(userId));
  const [leader] = pickRandom(canBeLeader);
  const everyoneElse = userIds.filter((userId) => userId !== leader);

  const identities = await IdentityDataSource.getIdentities();

  yield {
    userId: leader,
    ability: pickRandom(identities.leaders)[0],
  };

  const counts = distribution(userIds.length);
  const pool = [
    ...pickRandom(identities.traitors, { count: counts.traitor }),
    ...pickRandom(identities.assassins, { count: counts.assassin }),
    ...pickRandom(identities.guardians, { count: counts.guardian }),
  ];

  shuffleArray(pool);

  for (let i = 0; i < everyoneElse.length; ++i) {
    yield {
      userId: everyoneElse[i],
      ability: pool[i],
    };
  }
}

module.exports = {
  distribution,
  assign,
};
