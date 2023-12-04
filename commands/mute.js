const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const parseDuration = require('parse-duration');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('Duration of the mute')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the mute'))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute (interaction) {
        const member = interaction.options.getMember('user');
        if (!member.moderatable) {
            await interaction.reply({
                content: 'Unable to moderate this user.',
                ephemeral: true
            });
            return;
        }
        if (member.isCommunicationDisabled()) {
            await interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
            return;
        }
        if (parseDuration(interaction.options.getString('duration'), 'ms') > parseDuration('28d', 'ms')) {
            await interaction.reply({
                content: 'This mute is too long, please shorten it. (Discord limits mutes to 28 days)',
                ephemeral: true
            });
            return;
        }
        const reason = (interaction.member.nickname || interaction.user.displayName) + ' - ' + (interaction.options.getString('reason') || 'N/A');
        await member.timeout(parseDuration(interaction.options.getString('duration'), 'ms'), reason);
        await interaction.reply({
            content: 'User has been muted.',
            ephemeral: true
        });
    }
};