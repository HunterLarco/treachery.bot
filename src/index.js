const config = require('./config.private.json');

const environmentHelpers = require('./helpers/environment.js');

async function configureDiscordClient(environment) {
  const { client, commands } = environment;

  for (const command of commands.keys()) {
    console.log(`Loaded command '${command}'`);
  }

  client.on('message', async (message) => {
    if (!message.content.startsWith(config.prefix)) {
      return;
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args[0];

    if (!commands.has(commandName)) {
      return;
    }

    const command = commands.get(commandName);

    try {
      await command.execute(environment, message, args);
    } catch (error) {
      console.log('Failed to run command with error:', error);
      message.reply({
        embed: {
          title: 'Failed To Run Command',
          description: error.toString(),
        },
      });
    }
  });

  client.once('ready', () => {
    console.log('Ready!');
  });
}

async function main() {
  const environment = await environmentHelpers.create();
  await configureDiscordClient(environment);
  environment.client.login(config.token);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start with error:', error);
  });
}
