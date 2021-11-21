const { SlashCommandBuilder } = require('@discordjs/builders');
const { verifiedRole } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping'),
    async execute (interaction) {
        if (!interaction.member.roles.cache.has(verifiedRole)) {
            return interaction.reply({
                content: 'This command isn\'t allowed to be used by non-verified users.',
                ephemeral: true
            });
        }
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        interaction.editReply(`:heartbeat: ${interaction.client.ws.ping}ms\n:repeat: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }
}