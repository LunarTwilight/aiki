const { SlashCommandBuilder } = require('@discordjs/builders');
const { modRole } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('tells users to go to random'),
    async execute (interaction) {
        if (!interaction.member.roles.cache.has(modRole)) {
            return interaction.reply('You are not a mod, I\'d suggest you become one.');
        }
        interaction.reply('The mods request that you move this convo to <#563024520101888010>.');
    }
}