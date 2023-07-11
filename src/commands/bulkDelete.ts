import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import db from '../database.js';
const config = db.prepare('SELECT modRole FROM config WHERE guildId = ?');

export default {
    data: new SlashCommandBuilder()
        .setName('bulkdelete')
        .setDescription('Bulk deletes messages')
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('The number of messages to delete')
                .setRequired(true)
        )
        .setDMPermission(false),
    async execute (interaction: ChatInputCommandInteraction<'cached'>) {
        const { modRole } = config.get(interaction.guildId) as {
            modRole: string
        };
        const roles = interaction.member?.roles;
        if (!roles || Array.isArray(roles)) return;

        if (roles.highest.comparePositionTo(modRole) < 0) {
            await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
            return;
        }
        await interaction.channel?.bulkDelete(interaction.options.getInteger('number') ?? 1, true).then(async messages => {
            await interaction.reply({
                content: `Bulk deleted ${messages.size} messages.`,
                ephemeral: true
            });
        });
    }
};