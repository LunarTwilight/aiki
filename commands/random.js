const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const getConfig = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Tells users to go to random')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute (interaction) {
        const { randomChannel } = getConfig(interaction.guildId);
        await interaction.reply(`The mods request that you move this convo to <#${randomChannel}>.`);
    }
};