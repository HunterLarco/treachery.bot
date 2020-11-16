module.exports = {
  name: 'help',
  description: 'Shows you this message!',
  execute(environment, message, args) {
    message.channel.send({
      embed: {
        title: 'Treachery Help',
        description:
          'Treachery is a bot that helps you run your MTG Treachery games!',
        fields: Array.from(environment.commands.values()).map((command) => ({
          name: command.name,
          value: command.description,
        })),
      },
    });
  },
};
