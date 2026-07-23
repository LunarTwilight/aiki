const getConfig = require('./config.js');
const { clientId } = require('./config.json');

module.exports = {
    async execute (interaction) {
        const { reportsChannel } = getConfig(interaction.guildId);
        const channel = interaction.client.channels.cache.get(reportsChannel);
        const webhooks = await channel.fetchWebhooks();
        let channelWebhook = webhooks.first();
        let createdWebhook;

        if (!channelWebhook) {
            await channel.createWebhook({
                name: 'Honeypot',
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

        await channelWebhook.send({
            content: `IF YOU SEND A MESSAGE HERE, YOU **WILL** BE BANNED. THIS IS YOUR ONLY WARNING.`
        });
        const reply = {
            content: 'Honeypot message created',
            ephemeral: true
        };
        await (createdWebhook ? interaction.followUp(reply) : interaction.editReply(reply));
    }
};