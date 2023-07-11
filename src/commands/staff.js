const { SlashCommandBuilder } = require('discord.js');
const baseUrl = 'https://support.fandom.com/hc/requests/new?ticket_form_id=';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Posts a link to contact staff')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Optional category')
                .addChoices({
                    name: 'Account Help',
                    value: 'account_help'
                }, {
                    name: 'Wiki Changes',
                    value: 'wiki_changes'
                }, {
                    name: 'Problem',
                    value: 'problem'
                }, {
                    name: 'Protection',
                    value: 'protection'
                }, {
                    name: 'Other',
                    value: 'other'
                }, {
                    name: 'Bad Ad',
                    value: 'bad_ad'
                }, {
                    name: 'Spam/Vandal',
                    value: 'span_vandal'
                })
        ),
    async execute (interaction) {
        const cat = interaction.options.getString('category');
        if (!cat) {
            await interaction.reply('https://support.fandom.com');
            return;
        }
        switch (cat) {
        case 'account_help':
            await interaction.reply(baseUrl + '360000931094');
            break;
        case 'wiki_changes':
            await interaction.reply(baseUrl + '360000931354');
            break;
        case 'problem':
            await interaction.reply(baseUrl + '360000940393');
            break;
        case 'protection':
            await interaction.reply(baseUrl + '360000948854');
            break;
        case 'other':
            await interaction.reply(baseUrl + '360000956114');
            break;
        case 'bad_ad':
            await interaction.reply('<https://community.fandom.com/wiki/Help:Bad_advertisements>');
            break;
        case 'spam_vandal':
            await interaction.reply('Discord: <#866305196573327370>\nWiki: <https://soap.fandom.com>');
            break;
        }
    }
};