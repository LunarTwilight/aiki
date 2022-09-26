const { SlashCommandBuilder } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modRole FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bulkdelete')
        .setDescription('Bulk deletes messages')
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('The number of messages to delete')
                .setRequired(true)
        )
        .setDMPermission(false),
    async execute (interaction) {
        const { modRole } = config.get(interaction.guildId);
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
            return;
        }
        await interaction.channel.bulkDelete(interaction.options.getInteger('number'), true).then(async messages => {
            await interaction.reply({
                content: 'Bulk deleted ' + messages.size + ' messages.',
                ephemeral: true
            });
        });
    }
};