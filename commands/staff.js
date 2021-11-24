const { SlashCommandBuilder } = require('@discordjs/builders');
const baseUrl = 'https://support.fandom.com/hc/en-us/requests/new?ticket_form_id=';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('posts a link to zendesk')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Optional category')
                .addChoice('Account Help', 'account_help')
                .addChoice('Wiki Changes', 'wiki_changes')
                .addChoice('Problem', 'problem')
                .addChoice('Protection', 'protection')
                .addChoice('Other', 'other')
                .addChoice('Bad Ad', 'bad_ad')
                .addChoice('Spam/Vandal', 'spam_vandal')
        ),
    async execute (interaction) {
        const cat = interaction.options.getString('category');
        if (!cat) {
            return interaction.reply('Fandom: https://support.fandom.com\nGamepedia: https://support.gamepedia.com');
        }
        switch (cat) {
            case 'account_help':
                interaction.reply(baseUrl + '360000931094');
                break;
            case 'wiki_changes':
                interaction.reply(baseUrl + '360000931354');
                break;
            case 'problem':
                interaction.reply(baseUrl + '360000940393');
                break;
            case 'protection':
                interaction.reply(baseUrl + '360000948854');
                break;
            case 'other':
                interaction.reply(baseUrl + '360000956114');
                break;
            case 'bad_ad':
                interaction.reply('https://community.fandom.com/wiki/Help:Bad_advertisements');
                break;
            case 'spam_vandal':
                interaction.reply('Fandom: <#600818678682091562>\nGamepedia: <#573641974276423702>\nWiki: https://soap.fandom.com');
                break;
        }
    }
}