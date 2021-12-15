const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const parseDuration = require('parse-duration');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, muteRole, modChannel FROM config WHERE guildId = ?');
const addMuteToDB = db.prepare('INSERT INTO mutes (userId, guildId, expiry) VALUES (?, ?, ?)');

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
        const { modRole, muteRole, modChannel } = config.all(interaction.guildId)[0];
        if (!interaction.member.roles.cache.has(modRole)) {
            return interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
        }
        const member = interaction.options.getMember('user');
        if (member.roles.cache.has(muteRole)) {
            return interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
        }
        await member.roles.add(muteRole);
        const expiry = Date.now() + parseDuration(interaction.options.getString('duration'), 'ms');
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
                value: '<t:' + Math.floor(expiry / 1000) + '>',
                inline: true
            }, {
                name: 'Reason',
                value: interaction.options.getString('reason') ? interaction.options.getString('reason') : 'N/A',
                inline: true
            });
        await interaction.reply('User has been muted');
        await interaction.client.channels.cache.get(modChannel).send({
            embeds: [
                muteEmbed
            ]
        });
        addMuteToDB.run(member.id, interaction.guildId, expiry);
    }
}