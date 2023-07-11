import db from './database.js';
import { clientId } from './config.json';
import fs from 'fs';
import { ChatInputCommandInteraction } from 'discord.js';
const config = db.prepare('SELECT rulesChannel FROM config WHERE guildId = ?');

export default {
    async execute (interaction: ChatInputCommandInteraction) {
        const { rulesChannel } = config.get(interaction.guildId) as {
            rulesChannel: string
        };
        const channelrules = await interaction.client.channels.fetch(rulesChannel);
        if (!channelrules?.isTextBased() || channelrules.isDMBased() || channelrules.isThread()) return;
        
        const webhooks = await channelrules.fetchWebhooks();
        let channelWebhook = webhooks.first();
        let createdWebhook;

        if (!channelWebhook) {
            await channelrules.createWebhook({
                avatar: 'https://cdn.discordapp.com/icons/563020189604773888/e238c167354de75db9b5b5a23af93736.png',
                name: 'Rules'
            }).then(webhook => {
                channelWebhook = webhook;
            });
            await interaction.editReply({
                content: 'Webhook created'
            });
            createdWebhook = true;
        }
        if (channelWebhook?.owner?.id !== clientId) {
            await interaction.editReply({
                content: 'Rules webhook was not created by the bot.'
            });
            return;
        }

        const content = await fs.readFileSync('./rules.md', 'utf8');

        await channelWebhook.send(content);
        const reply = {
            content: 'Rules messages created',
            ephemeral: true
        };
        if (createdWebhook) {
            await interaction.followUp(reply);
        } else {
            await interaction.editReply(reply);
        }
    }
};