require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const statuses = ["with tickets", "Made by oil_gamer1054"];
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);

  let i = 0;
  setInterval(() => {
    client.user.setActivity(statuses[i], { type: 0 });
    i = (i + 1) % statuses.length;
  }, 5000);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🗑 Close Ticket')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeButton);

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Opened")
        .setDescription("Please describe your issue. A staff member will assist you shortly.")
        .setColor("Green");

      await ticketChannel.send({
        content: `<@${interaction.user.id}> Your ticket has been created.`,
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: '⏳ Closing this ticket in 3 seconds...', ephemeral: true });
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }

  if (interaction.isChatInputCommand()) {
    const allowedUserIds = process.env.ALLOWED_USER_IDS.split(',');

    if (interaction.commandName === 'ticket') {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({ content: '🚫 You are not allowed to use this command.', ephemeral: true });
      }

      const button = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('🎫 Create Ticket')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setTitle('🎟 Open a Ticket')
        .setDescription('Click the button below to open a support ticket.')
        .setColor('Blue');

      await interaction.reply({
        content: '📨 Ticket üzenet küldése folyamatban...',
        ephemeral: true
      });

      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });
    }
  }
});

client.on(Events.ClientReady, async () => {
  const data = [{
    name: 'ticket',
    description: 'Send the ticket creation button'
  }];

  try {
    await client.application.commands.set(data);
    console.log('✅ Global slash command registered.');
  } catch (error) {
    console.error('❌ Failed to register slash command:', error);
  }
});

client.login(process.env.TOKEN);