const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute (interaction) {
        await interaction.channel.bulkDelete(interaction.options.getInteger('number'), true).then(async messages => {
            await interaction.reply({
                content: `Bulk deleted ${messages.size} messages.`,
                ephemeral: true
            });
        });
    }
};