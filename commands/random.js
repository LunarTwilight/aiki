const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, randomChannel FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Tells users to go to random'),
    async execute (interaction) {
        if (!interaction.inGuild()) {
            return await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
        }
        const { modRole, randomChannel } = config.all(interaction.guildId)[0];
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            return await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
        }
        await interaction.reply('The mods request that you move this convo to <#' + randomChannel + '>.');
    }
}