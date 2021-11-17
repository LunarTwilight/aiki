const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { parseDuration } = require('parse-duration');
const { muteRole, modChanel } = require('./config.json');

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
        const member = interaction.options.getMember('user');
        if (member.roles.cache.has(muteRole)) {
            return interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
        }
        await member.roles.add(muteRole);
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
                name: 'Reason',
                value: interaction.options.getString('reason') ? interaction.options.getString('reason') : 'N/A',
                inline: true
            });
        await interaction.reply('User has been muted');
        await interaction.client.channels.cache.get(modChanel).send({
            embeds: [
                muteEmbed
            ]
        });
    }
}