const Discord = require('discord.js');

const environmentHelpers = require('./helpers/environment.js');

async function publishGuildCommands(environment) {
  const { discord, commands, config } = environment;

  const commandsJson = commands.map((command) =>
    new Discord.SlashCommandBuilder()
      .setName(command.name)
      .setDescription(command.description)
      .toJSON()
  );

  await discord.rest.put(
    Discord.Routes.applicationCommands(config.bot_client_id),
    { body: commandsJson }
  );
}

async function configureDiscordClient(environment) {
  const { discord, commands } = environment;

  for (const command of commands) {
    console.log(`Loaded command '${command.name}'`);
  }

  discord.client.on(Discord.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = commands.find(
      (command) => command.name == interaction.commandName
    );

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(environment, interaction);
    } catch (error) {
      console.log('Failed to run command with error:', error);
    }
  });

  discord.client.once(Discord.Events.ClientReady, () => {
    discord.client.user.setActivity('Treachery', {
      type: Discord.ActivityType.Competing,
    });
    console.log('Ready!');
  });
}

async function configureHealthCheck(environment) {
  return new Promise((resolve, reject) => {
    environment.server.get('/healthz', (request, response) => {
      if (environment.discord.client.readyTimestamp != null) {
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
  console.log(environment);
  await publishGuildCommands(environment);
  await configureHealthCheck(environment);
  await configureDiscordClient(environment);
  environment.discord.client.login(environment.config.bot_token);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start with error:', error);
  });
}
