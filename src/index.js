const environmentHelpers = require('./helpers/environment.js');

async function configureDiscordClient(environment) {
  const { client, commands } = environment;

  for (const command of commands) {
    console.log(`Loaded command '${command.name}'`);
    if (command.alias) {
      console.log(`  Alias: ${command.alias.join(', ')}`);
    }
  }

  client.on('message', async (message) => {
    if (!message.content.startsWith(environment.config.bot_prefix)) {
      return;
    }

    const args = message.content
      .slice(environment.config.bot_prefix.length)
      .trim()
      .split(/ +/);
    const commandName = args[0];

    const command = commands.find(
      (command) =>
        command.name == commandName ||
        (command.alias && command.alias.some((alias) => alias == commandName))
    );

    if (!command) {
      return;
    }

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

async function configureHealthCheck(environment) {
  return new Promise((resolve, reject) => {
    environment.server.get('/healthz', (request, response) => {
      if (environment.client.readyTimestamp != null) {
        response.send('ok');
      } else {
        response.status(503).send('not ready');
      }
    });

    environment.server.listen(environment.config.healthcheck_port, () => {
      console.log(
        `Health check active on port ${environment.config.healthcheck_port}`
      );
      resolve();
    });
  });
}

async function main() {
  const environment = await environmentHelpers.create();
  await configureHealthCheck(environment);
  await configureDiscordClient(environment);
  environment.client.login(environment.config.bot_token);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start with error:', error);
  });
}
