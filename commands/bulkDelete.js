const { SlashCommandBuilder } = require('@discordjs/builders');
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
        ),
    async execute (interaction) {
        if (!interaction.inGuild()) {
            return await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
        }
        const { modRole } = config.get(interaction.guildId);
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            return interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
        }
        interaction.channel.bulkDelete(interaction.options.getInteger('number'), true).then(messages => {
            interaction.reply({
                content: 'Bulk deleted ' + messages.size + ' messages.',
                ephemeral: true
            });
        })
    }
}