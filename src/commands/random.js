const { SlashCommandBuilder } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, randomChannel FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Tells users to go to random')
        .setDMPermission(false),
    async execute (interaction) {
        const { modRole, randomChannel } = config.all(interaction.guildId)[0];
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
            return;
        }
        await interaction.reply(`The mods request that you move this convo to <#${randomChannel}>.`);
    }
};