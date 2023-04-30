import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';

import * as environmentHelpers from '@/helpers/environment';

async function publishGuildCommands(environment: any) {
  const { discord, commands, config } = environment;

  const commandsJson = commands.map((command: any) =>
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

async function configureDiscordClient(environment: any) {
  const { discord, commands } = environment;

  for (const command of commands) {
    console.log(`Loaded command '${command.name}'`);
  }

  discord.client.on(
    Discord.Events.InteractionCreate,
    async (interaction: any) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }

      const command = commands.find(
        (command: any) => command.name == interaction.commandName
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
    }
  );

  discord.client.once(Discord.Events.ClientReady, () => {
    discord.client.user.setActivity('Treachery', {
      type: Discord.ActivityType.Competing,
    });
    console.log('Ready!');
  });
}

async function configureHealthCheck(environment: any) {
  return new Promise<void>((resolve, reject) => {
    environment.server.get('/healthz', (request: any, response: any) => {
      if (environment.discord.client.readyTimestamp != null) {
        response.send('ok');
      } else {
        response.status(503).send('not ready');
      }
    });

    environment.server.get('/livez', (_request: any, response: any) => {
      response.send('ok');
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
  // Load environment variables from .env (primarily used during local
  // development so that we can use a single file to consistently apply
  // environment variables). See README.md for more details on required
  // environment variables.
  dotenv.config();

  const environment = await environmentHelpers.create();
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
