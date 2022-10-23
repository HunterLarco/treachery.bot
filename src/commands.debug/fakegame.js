const { createGame } = require('../helpers/createGame.js');
const { FAKE_USER_ID } = require('../data/fakeUserId.js');

const { generateGameStartedEmbed } = require('../embeds/gameStarted.js');
const { generateAbilityEmbed } = require('../embeds/ability.js');

module.exports = {
  name: 'fakegame',
  description: 'Starts a new game of treachery with fake players.',
  async execute(environment, interaction) {
    await interaction.deferReply();

    const { abilities } = await createGame(environment, {
      playerIds: [
        interaction.user.id,
        FAKE_USER_ID,
        FAKE_USER_ID,
        FAKE_USER_ID,
      ],
      notLeaderPlayerIds: new Set(),
    });

    const leader = abilities.find(
      ({ ability }) => ability.types.subtype == 'Leader'
    );
    const user = abilities.find(({ userId }) => userId == interaction.user.id);

    await interaction.editReply({
      embeds: [
        generateGameStartedEmbed(interaction.user.id, [
          interaction.user.id,
          FAKE_USER_ID,
          FAKE_USER_ID,
          FAKE_USER_ID,
        ]),
        generateAbilityEmbed(leader.ability, {
          name:
            leader.userId == FAKE_USER_ID
              ? 'Fake User'
              : interaction.user.username,
        }),
      ],
    });

    interaction.user.send({
      embeds: [generateAbilityEmbed(user.ability)],
    });
  },
};
