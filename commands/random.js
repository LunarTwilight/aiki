const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('tells users to go to random'),
    async execute (interaction) {
        const guildConfig = config.find(item => item.guildId === BigInt(interaction.guildId));
        if (!interaction.member.roles.cache.has(guildConfig.modRole.toString())) {
            return interaction.reply('You are not a mod, I\'d suggest you become one.');
        }
        interaction.reply('The mods request that you move this convo to <#' + guildConfig.randomChannel.toString() + '>.');
    }
}