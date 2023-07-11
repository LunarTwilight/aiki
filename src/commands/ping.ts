import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import db from '../database.js';
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get the bot\'s ping')
        .setDMPermission(false),
    async execute (interaction: ChatInputCommandInteraction) {
        const { verifiedRole } = config.get(interaction.guildId) as {
            verifiedRole: string
        };
        const roles = interaction.member?.roles;
        if (!roles || Array.isArray(roles)) return;
        if (!roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: 'This command isn\'t allowed to be used by non-verified users.',
                ephemeral: true
            });
            return;
        }
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        await interaction.editReply(`:heartbeat: ${interaction.client.ws.ping}ms\n:repeat: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }
};