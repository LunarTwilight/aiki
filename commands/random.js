const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, randomChannel FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('tells users to go to random'),
    async execute (interaction) {
        const { modRole, randomChannel } = config.all(BigInt(interaction.guildId))[0];
        if (!interaction.member.roles.cache.has(modRole.toString())) {
            return interaction.reply('You are not a mod, I\'d suggest you become one.');
        }
        interaction.reply('The mods request that you move this convo to <#' + randomChannel.toString() + '>.');
    }
}