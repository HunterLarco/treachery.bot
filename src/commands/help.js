module.exports = {
  name: 'help',
  description: 'Shows you this message!',
  async execute(environment, interaction) {
    await interaction.reply({
      embeds: [
        {
          title: 'Treachery Help',
          description:
            'Treachery is a bot that helps you run your MTG Treachery games!',
          fields: environment.commands.map((command) => ({
            name: command.name,
            value: command.description,
          })),
        },
      ],
    });
  },
};
