const Discord = require('discord.js');

const config = require('./config.private.json');
const LeaderAbilities = require('./data/LeaderAbilities.json');
const abilityHelpers = require('./helpers/ability.js');

const client = new Discord.Client();

const Emojis = {
  ThumbsUp: '👍',
  Rocket: '🚀',
  Stop: '🛑',
};

function randomRole(roles) {
  const keys = Object.keys(roles);
  const key = keys[Math.floor(Math.random()) * keys.length];
  return roles[key];
}

const commands = {
  help(message) {
    message.channel.send({
      embed: {
        title: 'Treachery Help',
        description:
          'Treachery is a bot that helps you run your MTG Treachery games!',
        fields: [
          {
            name: 'play',
            value: 'Starts a new game of treachery',
          },
          {
            name: 'rules',
            value: 'Describes the rules of treachery.',
          },
          {
            name: 'reveal',
            value: 'Reveals your current role to the channel.',
          },
          {
            name: 'whoami',
            value: 'Privately messages you your current role.',
          },
          {
            name: 'help',
            value: 'Shows you this message!',
          },
        ],
      },
    });
  },

  rules(message) {
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

  play(message) {
    message.channel
      .send({
        embed: {
          title: 'Treachery Game Setup',
          description:
            'To join this game, click the thumbs-up emoji below. The game will ' +
            'start when someone clicks the rocket emoji.',
        },
      })
      .then((embed) => {
        embed.react('👍');
        embed.react('🚀');
        embed.react('🛑');

        const collector = embed.createReactionCollector(
          (reaction, user) => user.id != embed.author.id,
          { idle: 120000, dispose: true }
        );

        const players = new Set();

        collector.on('collect', async (reaction, user) => {
          switch (reaction.emoji.name) {
            case Emojis.ThumbsUp:
              players.add(user.id);
              break;
            case Emojis.Rocket:
              console.log(client.users, players);
              const users = await Promise.all(
                Array.from(players).map((id) => client.users.fetch(id))
              );

              message.channel.send({
                embed: {
                  title: 'Treachery Game Starting!',
                  description:
                    `The game has been started by ${user.tag}. All of the ` +
                    'below players will be privately messaged a role.',
                  fields: [
                    {
                      name: 'Players',
                      value: '• ' + users.map((user) => user.tag).join('\n• '),
                    },
                  ],
                },
              });

              for (const user of users) {
                user.send(
                  abilityHelpers.createEmbed(
                    abilityHelpers.pickRandom(LeaderAbilities)
                  )
                );
              }
              collector.stop();
              break;
            case Emojis.Stop:
              message.channel.send({
                embed: {
                  title: 'Treachery Game Cancelled',
                  description: `The game was cancelled by ${user.tag}`,
                },
              });
              collector.stop();
              break;
          }
        });

        collector.on('remove', (reaction, user) => {
          switch (reaction.emoji.name) {
            case Emojis.ThumbsUp:
              players.delete(user.id);
              break;
          }
        });

        collector.on('end', (collected) => {
          console.log(`Collected ${collected.size} items`);
        });
      });
  },
};

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  if (message.content.startsWith(config.prefix)) {
    const command = message.content.slice(1);
    if (commands[command]) {
      commands[command](message);
    }
  }
});

client.login(config.token);
