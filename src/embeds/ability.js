const { EmbedBuilder } = require('discord.js');

function generateTitle(ability, options) {
  const { name } = options || {};

  const pronouns = {
    Leader: 'the',
    Assassin: 'an',
    Traitor: 'a',
    Guardian: 'a',
  };

  return (
    (name ? `${name} is` : 'You are') +
    ` ${pronouns[ability.types.subtype]} ${ability.types.subtype}` +
    `: ${ability.name}`
  );
}

function generateAbilityEmbed(ability, options) {
  return new EmbedBuilder()
    .setTitle(generateTitle(ability, options))
    .setDescription(`[View on mtgtreachery](${ability.uri})`)
    .setImage(ability.image)
    .addFields({
      name: 'Description',
      value: ability.text.replace(/\|/g, '\n'),
    });
}

module.exports = {
  generateAbilityEmbed,
};
