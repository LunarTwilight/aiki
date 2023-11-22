const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get the bot\'s ping')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads),
    async execute (interaction) {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        await interaction.editReply(`:heartbeat: ${interaction.client.ws.ping}ms\n:repeat: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }
};