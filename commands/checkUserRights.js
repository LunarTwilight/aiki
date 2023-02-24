const { SlashCommandBuilder } = require('discord.js');
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
        )
        .setDMPermission(false),
    async execute (interaction) {
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
            if (req.body.query.users[0].missing) {
                await interaction.reply({
                    content: 'User doesn\'t exist!',
                    ephemeral: true
                });
                return;
            }
            if (req.body.query.users[0].invalid) {
                await interaction.reply({
                    content: 'Not a valid user! (perhaps you tried using an IP?)',
                    ephemeral: true
                });
                return;
            }

            const ug = req.body.query.users[0].groups;
            await interaction.reply(`**${interaction.options.getString('user')}**:\nAutoconfirmed: ${ug.includes('autoconfirmed') ? 'yes' : 'no'}\nEmailconfirmed: ${ug.includes('emailconfirmed') ? 'yes' : 'no'}`);
        });
    }
};