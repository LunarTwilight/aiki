const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const needle = require('needle');

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
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads),
    async execute (interaction) {
        needle.request('get', 'https://community.fandom.com/api.php', {
            action: 'query',
            list: 'users',
            ususers: interaction.options.getString('user'),
            usprop: 'groups|registration',
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
            const registration = new Date(req.body.query.users[0].registration);
            const willBeAutoconfirmed = registration.setDate(registration.getDate() + 4);
            const willBeAutoconfirmedTimestamp = Math.floor(new Date(willBeAutoconfirmed).getTime() / 1000);
            await interaction.reply(`**${interaction.options.getString('user')}**:\nAutoconfirmed: ${ug.includes('autoconfirmed') ? 'yes' : 'no; will be <t:' + willBeAutoconfirmedTimestamp + ':R>'}\nEmailconfirmed: ${ug.includes('emailconfirmed') ? 'yes' : 'no'}`);
        });
    }
};