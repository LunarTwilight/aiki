const db = require('./database.js');
const config = db.prepare('SELECT rulesChannel FROM config WHERE guildId = ?');
const { clientId } = require('./config.json');
const fs = require('fs');

module.exports = {
    async execute (interaction) {
        const { rulesChannel } = config.get(interaction.guildId);
        const channelrules = interaction.client.channels.cache.get(rulesChannel);
        const webhooks = await channelrules.fetchWebhooks();
        let channelWebhook = webhooks.first();
        let createdWebhook;

        if (!channelWebhook) {
            await channelrules.createWebhook({
                name: 'Rules',
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
                content: 'Rules webhook was not created by the bot.',
                ephemeral: true
            });
            return;
        }

        const content = await fs.readFileSync('./rules.md', 'utf8');

        const customSplitMessage = text => [
            text.slice(0, 2000),
            text.substring(2000, text.length)
        ];

        await channelWebhook.send('https://static.wikia.nocookie.net/central/images/6/6f/Fandom_Rules.png');
        await channelWebhook.send(customSplitMessage(content)[0]);
        await channelWebhook.send(customSplitMessage(content)[1]);
        const reply = {
            content: 'Rules messages created',
            ephemeral: true
        };
        await (createdWebhook ? interaction.followUp(reply) : interaction.editReply(reply));
    }
};