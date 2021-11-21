const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Eval')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to eval')
                .setRequired(true)),
    async execute (interaction) {
        interaction.reply('something happened ig');
        eval(interaction.options.getString('input'));
    }
}