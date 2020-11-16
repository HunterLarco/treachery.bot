module.exports = {
  name: 'rules',
  description: 'Describes the rules of treachery.',
  execute(environment, message, args) {
    message.channel.send({
      embed: {
        title: 'Treachery Rules',
        description:
          'Before the game begins, each player is randomly, and secretly, ' +
          'dealt an Identity card (which defines their role) from a ' +
          'predetermined selection. Victory is determined by your role. In ' +
          'addition, each non-Leader role is granted a powerful, 1-use, ' +
          'unveil ability that can change the course of the game but at the ' +
          'cost of revealing your identity to all players.',
        fields: [
          {
            name: 'The Leader',
            value:
              'The Leader, and their Guardians, win if they are the last ' +
              'players standing.',
          },
          {
            name: 'The Guardians',
            value: 'The Guardians help the Leader, they win or lose with them.',
          },
          {
            name: 'The Assassins',
            value: 'The Assassins win if the Leader is eliminated.',
          },
          {
            name: 'The Traitor',
            value:
              'The Traitor wins if they are the last player standing. (This ' +
              'implies killing the Assassins before the Leader, as well as ' +
              'other Traitors if there are more than one.)',
          },
        ],
      },
    });
  },
};
