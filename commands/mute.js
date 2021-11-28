const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const parseDuration = require('parse-duration');
const config = require('../config.js');
const db = require('../database.js');
const addMuteToDB = db.prepare('INSERT INTO mutes (userId, guildId, expiry) VALUES (?, ?, ?)');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')),
    async execute (interaction) {
        const guildConfig = config.find(item => item.guildId === BigInt(interaction.guildId));
        if (!interaction.member.roles.cache.has(guildConfig.modRole.toString())) {
            return interaction.reply('You are not a mod, I\'d suggest you become one.');
        }
        const member = interaction.options.getMember('user');
        if (member.roles.cache.has(guildConfig.muteRole.toString())) {
            return interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
        }
        await member.roles.add(guildConfig.muteRole.toString());
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
        await interaction.client.channels.cache.get(guildConfig.modChannel.toString()).send({
            embeds: [
                muteEmbed
            ]
        });
        addMuteToDB.run(member.id, interaction.guildId, expiry);
    }
}