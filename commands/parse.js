const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const needle = require('needle');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parse')
        .setDescription('Parses wikitext')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The wikitext to parse')
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads),
    async execute (interaction) {
        needle.request('get', 'https://community.fandom.com/api.php', {
            action: 'parse',
            text: interaction.options.getString('text'),
            contentmodel: 'wikitext',
            format: 'json',
            formatversion: 2,
            disabletoc: true,
            disablelimitreport: true,
            wrapoutputclass: null,
            prop: 'text'
        }, {
            user_agent: 'Aiki (contact Sophiedp about issues)'
        }, async (err, req) => {
            if (err || req.body.error) {
                console.error((err || req.body.error));
                await interaction.reply({
                    content: 'Something went wrong while requesting data from the API!',
                    ephemeral: true
                });
                return;
            }

            if (req.body.parse.text.length > 1985) {
                await interaction.reply('Sorry, result is too long.');
                return;
            }

            if (!req.body.parse.text.length) {
                await interaction.reply('```\n""\n```');
                return;
            }

            await interaction.reply('```html\n' + req.body.parse.text + '\n```');
        });
    }
};