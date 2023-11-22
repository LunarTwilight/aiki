const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, randomChannel FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Tells users to go to random')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute (interaction) {
        const { randomChannel } = config.all(interaction.guildId)[0];
        await interaction.reply(`The mods request that you move this convo to <#${randomChannel}>.`);
    }
};