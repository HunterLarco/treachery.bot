const {
  ComponentType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { createGame } = require('../helpers/createGame.js');
const abilityHelpers = require('../helpers/ability.js');

const { generateGameSetupEmbed } = require('../embeds/gameSetup.js');
const { generateCanceledGameEmbed } = require('../embeds/gameCanceled.js');
const { generateGameStartedEmbed } = require('../embeds/gameStarted.js');

function generateJoinedMessage(canBeLeader) {
  return {
    content: `You've joined the game!`,
    ephemeral: true,
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('leave')
          .setLabel('Leave Game')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('toggle_leader')
          .setLabel(
            canBeLeader ? `I don't want to be the leader` : `Enable Leader`
          )
          .setStyle(ButtonStyle.Secondary)
      ),
    ],
  };
}

class GameCreationManager {
  constructor(environment) {
    this.environment_ = environment;

    this.readyUserIds_ = new Set();
    this.notLeaderUserIds_ = new Set();

    this.frozen_ = false;

    this.ui_ = {
      setup: null,
      join: new Map(),
    };
  }

  /// Setup Message Interaction Handling

  async setupGame(interaction) {
    if (this.ui_.setup) {
      throw 'The game has already been setup';
    } else if (this.frozen_) {
      await interaction.deferUpdate();
      return;
    }

    const message = await interaction.reply(this.generateGameSetupMessage());
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      idle: 300000,
    });
    collector.on('collect', (i) => this.buttonTrampoline(i));

    this.ui_.setup = {
      interaction,
      collector,
    };
  }

  async joinGame(interaction) {
    if (this.frozen_ || this.readyUserIds_.has(interaction.user.id)) {
      await interaction.deferUpdate();
      return;
    }

    this.readyUserIds_.add(interaction.user.id);

    await Promise.all([
      this.ui_.setup.interaction.editReply(this.generateGameSetupMessage()),
      interaction.reply(generateJoinedMessage(true)),
    ]);

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      idle: 300000,
    });
    collector.on('collect', (i) => this.buttonTrampoline(i));

    this.ui_.join.set(interaction.user.id, {
      interaction,
      collector,
    });
  }

  async cancelGame(interaction) {
    if (this.frozen_) {
      await interaction.deferUpdate();
      return;
    }

    this.frozen_ = true;

    /// Stop active collectors.

    for (const { collector } of this.ui_.join.values()) {
      collector.stop();
    }
    this.ui_.setup.collector.stop();

    /// Update all embeds.

    const promises = [
      interaction.update({
        embeds: [generateCanceledGameEmbed(interaction.user.id)],
        components: [],
      }),
    ];
    for (const { interaction: joinInteraction } of this.ui_.join.values()) {
      promises.push(
        joinInteraction.editReply({
          content: `The game was canceled by <@${interaction.user.id}>.`,
          components: [],
        })
      );
    }
    await Promise.all(promises);

    /// Cleanup the UI elements

    this.ui_.setup = null;
    this.ui_.join = new Map();
  }

  async startGame(interaction) {
    if (this.frozen_) {
      await interaction.deferUpdate();
      return;
    }

    this.frozen_ = true;

    /// Stop active collectors.

    for (const { collector } of this.ui_.join.values()) {
      collector.stop();
    }
    this.ui_.setup.collector.stop();

    /// Update all embeds.

    const promises = [
      interaction.update({
        embeds: [
          generateGameStartedEmbed(interaction.user.id, [
            ...this.readyUserIds_,
          ]),
        ],
        components: [],
      }),
    ];
    for (const { interaction: joinInteraction } of this.ui_.join.values()) {
      promises.push(
        joinInteraction.editReply({
          content:
            `The game has started by <@${interaction.user.id}>! Check ` +
            `your dm's for your role.`,
          components: [],
        })
      );
    }
    await Promise.all(promises);

    /// Cleanup the UI elements

    this.ui_.setup = null;
    this.ui_.join = new Map();
  }

  /// Join Message Interaction Handling

  async leaveGame(interaction) {
    if (this.frozen_) {
      await interaction.deferUpdate();
      return;
    }

    this.readyUserIds_.delete(interaction.user.id);
    this.notLeaderUserIds_.delete(interaction.user.id);

    await Promise.all([
      interaction.update({
        content: `You've been removed from the game.`,
        components: [],
      }),
      this.ui_.setup.interaction.editReply(this.generateGameSetupMessage()),
    ]);

    // Stop the button collection on the joined message.
    this.ui_.join.get(interaction.user.id).collector.stop();

    // Cleanup the ui element.
    this.ui_.join.delete(interaction.user.id);
  }

  async toggleLeader(interaction) {
    if (this.frozen_) {
      await interaction.deferUpdate();
      return;
    }

    let canBeLeader;
    if (this.notLeaderUserIds_.has(interaction.user.id)) {
      this.notLeaderUserIds_.delete(interaction.user.id);
      canBeLeader = true;
    } else {
      this.notLeaderUserIds_.add(interaction.user.id);
      canBeLeader = false;
    }

    await Promise.all([
      interaction.update(generateJoinedMessage(canBeLeader)),
      this.ui_.setup.interaction.editReply(this.generateGameSetupMessage()),
    ]);
  }

  /// Button Trampoline

  async buttonTrampoline(interaction) {
    switch (interaction.customId) {
      case 'join':
        await this.joinGame(interaction);
        return;
      case 'start':
        await this.startGame(interaction);
        return;
      case 'cancel':
        await this.cancelGame(interaction);
        return;
      case 'toggle_leader':
        await this.toggleLeader(interaction);
        return;
      case 'leave':
        await this.leaveGame(interaction);
        return;
    }

    console.error(`Received unexpected interaction "${interaction.customId}".`);
  }

  /// Message Generators

  createReadyPlayerInfos() {
    const infos = [];
    for (const id of this.readyUserIds_) {
      infos.push({
        id,
        labels: this.notLeaderUserIds_.has(id) ? ['Not Leader'] : [],
      });
    }
    return infos;
  }

  generateGameSetupMessage() {
    return {
      embeds: [generateGameSetupEmbed(this.createReadyPlayerInfos())],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('join')
            .setLabel('Join')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('start')
            .setLabel('Start')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    };
  }
}

module.exports = {
  name: 'play',
  description: 'Starts a new game of treachery.',
  async execute(environment, interaction) {
    const manager = new GameCreationManager(environment);
    await manager.setupGame(interaction);
  },
};
