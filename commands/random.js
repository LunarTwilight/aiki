const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('tells users to go to random'),
    async execute (interaction) {
        interaction.reply('The mods request that you move this convo to <#563024520101888010>.');
    }
}