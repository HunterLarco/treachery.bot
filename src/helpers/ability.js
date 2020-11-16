const pickRandom = require('pick-random');
const shuffleArray = require('shuffle-array');

const AssassinAbilities = require('../data/AssassinAbilities.json');
const GuardianAbilities = require('../data/GuardianAbilities.json');
const LeaderAbilities = require('../data/LeaderAbilities.json');
const TraitorAbilities = require('../data/TraitorAbilities.json');

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
  if (users.length < 4 || users.length > 8) {
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

function* assign(users) {
  const counts = distribution(users.length);
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
  distribution,
  distributionText,
  assign,
};
