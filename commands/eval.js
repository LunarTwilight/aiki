const { SlashCommandBuilder } = require('@discordjs/builders');
const { devId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Eval')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to eval')
                .setRequired(true)),
    async execute (interaction) {
        if (interaction.user.id !== devId) {
            return interaction.reply({
                content: 'https://tenor.com/view/anko-stick-tongue-out-tamako-market-taunt-gif-12801230',
                ephemeral: true
            });
        }
        interaction.reply('something happened ig');
        eval(interaction.options.getString('input'));
    }
}