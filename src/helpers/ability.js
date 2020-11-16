function createEmbed(ability) {
  console.log(ability.image);
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

function pickRandom(abilityMap) {
  const abilities = Object.values(abilityMap);
  return abilities[Math.floor(Math.random() * abilities.length)];
}

module.exports = {
  createEmbed,
  pickRandom,
};
