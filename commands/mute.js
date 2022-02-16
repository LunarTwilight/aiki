const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const parseDuration = require('parse-duration');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, modChannel FROM config WHERE guildId = ?');

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
        const { modRole, modChannel } = config.all(interaction.guildId)[0];
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            return interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
        }
        const member = interaction.options.getMember('user');
        if (member.communicationDisabledUntil) {
            return interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
        }
        if (parseDuration(interaction.options.getString('duration'), 'ms') > parseDuration('28d', 'ms')) {
            return interaction.reply({
                content: 'This mute is too long, please shorten it. (Discord limits mutes to 28 days)',
                ephemeral: true
            });
        }
        member.timeout(parseDuration(interaction.options.getString('duration'), 'ms'), (interaction.options.getString('reason') || 'N/A'));
        const muteEmbed = new MessageEmbed()
            .setTitle('User muted')
            .addFields({
                name: 'User',
                value: '<@' + member.id + '>',
                inline: true
            }, {
                name: 'Duration',
                value: interaction.options.getString('duration'),
                inline: true
            }, {
                name: 'Expiry',
                value: '<t:' + Math.floor((Date.now() + parseDuration(interaction.options.getString('duration'), 'ms')) / 1000) + '>',
                inline: true
            }, {
                name: 'Reason',
                value: (interaction.options.getString('reason') || 'N/A'),
                inline: true
            });
        await interaction.reply('User has been muted');
        await interaction.client.channels.cache.get(modChannel).send({
            embeds: [
                muteEmbed
            ]
        });
    }
}