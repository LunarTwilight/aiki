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

        await channelWebhook.send('https://static.wikia.nocookie.net/central/images/6/6f/Fandom_Rules.png');
        if (content.includes('%%SPLIT%%')) {
            const parts = content.split('%%SPLIT%%');
            for (const part of parts) {
                await channelWebhook.send(part.trim());
            }
        } else {
            await channelWebhook.send(content);
        }
        const reply = {
            content: 'Rules messages created',
            ephemeral: true
        };
        await (createdWebhook ? interaction.followUp(reply) : interaction.editReply(reply));
    }
};