const pickRandom = require('pick-random');
const shuffleArray = require('shuffle-array');

const { IdentityDataSource } = require('../data/MTGTreacheryDataSource.js');

function createEmbed(ability, options) {
  const { name } = options || {};

  return {
    embed: {
      title:
        (name ? `${name} is` : 'You are') +
        { Leader: ' the ', Assassin: ' an ', Traitor: ' a ', Guardian: ' a ' }[
          ability.types.subtype
        ] +
        `${ability.types.subtype}: ${ability.name}!`,
      description: `[View on mtgtreachery](${ability.uri})`,
      image: {
        url: ability.image,
      },
      fields: [
        {
          name: 'Description',
          value: ability.text.replace(/\|/g, '\n'),
        },
      ],
    },
  };
}

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

function distributionText(players) {
  const counts = distribution(players);

  let text = '1 leader, ';

  if (counts.traitor == 1) {
    text += '1 traitor, ';
  } else {
    text += `${counts.traitor} traitors, `;
  }

  text += `${counts.assassin} assassins, and `;

  if (counts.guardian == 1) {
    text += '1 guardian, ';
  } else {
    text += `${counts.guardian} guardians, `;
  }

  return text;
}

async function* debugAssign(userIds, { notLeader }) {
  const canBeLeader = userIds.filter((userId) => !notLeader.has(userId));
  const [leader] = canBeLeader.length ? pickRandom(canBeLeader) : [null];
  const everyoneElse = userIds.filter((userId) => userId !== leader);

  const identities = await IdentityDataSource.getIdentities();

  if (leader) {
    yield {
      userId: leader,
      ability: pickRandom(identities.leaders)[0],
    };
  }

  const pool = pickRandom(
    [...identities.traitors, ...identities.assassins, ...identities.guardians],
    { count: everyoneElse.length }
  );

  shuffleArray(pool);

  for (let i = 0; i < everyoneElse.length; ++i) {
    yield {
      userId: everyoneElse[i],
      ability: pool[i],
    };
  }
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

  const counts = distribution(users.length);
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
  createEmbed,
  distribution,
  distributionText,
  assign,
  debugAssign,
};
