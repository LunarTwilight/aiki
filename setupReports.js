const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('./database.js');
const config = db.prepare('SELECT reportsChannel FROM config WHERE guildId = ?');
const { clientId } = require('./config.json');

module.exports = {
    async execute (interaction) {
        const { reportsChannel } = config.get(interaction.guildId);
        const channel = interaction.client.channels.cache.get(reportsChannel);
        const webhooks = await channel.fetchWebhooks();
        let channelWebhook = webhooks.first();
        let createdWebhook;

        if (!channelWebhook) {
            await channel.createWebhook({
                name: 'Server Reports',
                avatar: interaction.guild.iconURL()
            }).then(webhook => {
                channelWebhook = webhook;
            });
            await interaction.editReply({
                content: 'Webhook created',
                ephemeral: true
            });
            createdWebhook = true;
        }
        if (channelWebhook.owner.id !== clientId) {
            await interaction.editReply({
                content: 'Reports webhook was not created by the bot.',
                ephemeral: true
            });
            return;
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create-private-report-thread')
                .setLabel('Create Private Report')
                .setStyle(ButtonStyle.Primary)
        );
        await channelWebhook.send({
            content: `If you need to submit a report that requires some privacy, you can create a private thread here. It will only be available to our mod team unless you @mention someone else.\n\nIf your issue or request can be publicly available, please create a post in <#1127445997614801006> instead.`,
            components: [row]
        });
        const reply = {
            content: 'Reports message created',
            ephemeral: true
        };
        if (createdWebhook) {
            await interaction.followUp(reply);
        } else {
            await interaction.editReply(reply);
        }
    }
};