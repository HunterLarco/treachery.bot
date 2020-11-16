const pickRandom = require('pick-random');
const shuffleArray = require('shuffle-array');

const AssassinAbilities = require('../data/AssassinAbilities.json');
const GuardianAbilities = require('../data/GuardianAbilities.json');
const LeaderAbilities = require('../data/LeaderAbilities.json');
const TraitorAbilities = require('../data/TraitorAbilities.json');

function createEmbed(ability) {
  return {
    embed: {
      title: `You are a ${ability.types.subtype}: ${ability.name}!`,
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

function* assign(users) {
  if (users.length < 4 || users.length > 8) {
    throw 'Treachery requires 4-8 players';
  }

  const counts = {
    leader: 1,
    traitor: 1,
    assassin: 2,
    guardian: 0,
  };

  if (users.length >= 8) {
    counts.traitor = 2;
  }

  if (users.length >= 6) {
    counts.assassin = 3;
  }

  if (users.length >= 7) {
    counts.guardian = 2;
  } else if (users.length >= 5) {
    counts.guardian = 1;
  }

  const pool = [
    ...pickRandom(Object.values(LeaderAbilities), { count: counts.leader }),
    ...pickRandom(Object.values(TraitorAbilities), { count: counts.traitor }),
    ...pickRandom(Object.values(AssassinAbilities), { count: counts.assassin }),
    ...pickRandom(Object.values(GuardianAbilities), {
      count: counts.guardian,
    }),
  ];

  shuffleArray(pool);

  for (let i = 0; i < users.length; ++i) {
    yield {
      user: users[i],
      ability: pool[i],
    };
  }
}

module.exports = {
  createEmbed,
  assign,
};