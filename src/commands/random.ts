import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import db from '../database.js';
const config = db.prepare('SELECT modRole, randomChannel FROM config WHERE guildId = ?');

export default {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Tells users to go to random')
        .setDMPermission(false),
    async execute (interaction: ChatInputCommandInteraction) {
        const { modRole, randomChannel } = config.all(interaction.guildId)[0] as {
            modRole: string
            randomChannel: string
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
        await interaction.reply(`The mods request that you move this convo to <#${randomChannel}>.`);
    }
};