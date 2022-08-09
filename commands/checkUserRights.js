const { SlashCommandBuilder } = require('@discordjs/builders');
const needle = require('needle');
const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkuserrights')
        .setDescription('Checks if a user is autoconfirmed and emailconfirmed')
        .addStringOption(option =>
            option
                .setName('user')
                .setDescription('The username of the user')
                .setRequired(true)
        ),
    async execute (interaction) {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
            return;
        }
        const { verifiedRole } = config.get(interaction.guildId);
        if (!interaction.member.roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: 'This command can not be used by non-verified users.',
                ephemeral: true
            });
            return;
        }

        needle.request('get', 'https://community.fandom.com/api.php', {
            action: 'query',
            list: 'users',
            ususers: interaction.options.getString('user'),
            usprop: 'groups',
            formatversion: 2,
            format: 'json'
        }, {
            // eslint-disable-next-line camelcase
            user_agent: 'Aiki (contact Sophiedp abot issues)'
        }, async (err, req) => {
            if (err || req.body.error) {
                console.error((err || req.body.error));
                await interaction.reply({
                    content: 'Something went wrong while requesting data from the API!',
                    ephemeral: true
                });
                return;
            }
            if (req.body.query.users[0].missing) {
                await interaction.reply({
                    content: 'User doesn\'t exsit!',
                    ephemeral: true
                });
                return;
            }

            const ug = req.body.query.users[0].groups;
            await interaction.reply(`Autoconfirmed: ${ug.includes('autoconfirmed') ? 'yes' : 'no'}\nEmailconfirmed: ${ug.includes('emailconfirmed') ? 'yes' : 'no'}`);
        });
    }
};