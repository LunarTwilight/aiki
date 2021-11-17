const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping'),
    async execute (interaction) {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        interaction.editReply(`:heartbeat: ${interaction.client.ws.ping}ms\n:repeat: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }
}