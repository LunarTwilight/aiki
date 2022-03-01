const { SlashCommandBuilder } = require('@discordjs/builders');
const parseDuration = require('parse-duration');
const db = require('../database.js');
const config = db.prepare('SELECT modRole FROM config WHERE guildId = ?');

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
                .setDescription('Reason for the mute')),
    async execute (interaction) {
        if (!interaction.inGuild()) {
            return await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
        }
        const { modRole } = config.get(interaction.guildId);
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            return await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
        }
        const member = interaction.options.getMember('user');
        if (!member.moderatable) {
            return await interaction.reply({
                content: 'Unable to moderate this user.',
                ephemeral: true
            });
        }
        if (member.communicationDisabledUntil) {
            return await interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
        }
        if (parseDuration(interaction.options.getString('duration'), 'ms') > parseDuration('28d', 'ms')) {
            return await interaction.reply({
                content: 'This mute is too long, please shorten it. (Discord limits mutes to 28 days)',
                ephemeral: true
            });
        }
        member.timeout(parseDuration(interaction.options.getString('duration'), 'ms'), (interaction.options.getString('reason') || 'N/A'));
        await interaction.reply({
            content: 'User has been muted.',
            ephemeral: true
        })
    }
}