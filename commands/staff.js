const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('posts a link to zendesk'),
    async execute (interaction) {
        interaction.reply('Fandom: https://support.fandom.com\nGamepedia: https://support.gamepedia.com');
    }
}