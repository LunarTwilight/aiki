const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get the bot\'s ping'),
    async execute (interaction) {
        const { verifiedRole } = config.get(interaction.guildId);
        if (interaction.inGuild() && !interaction.member.roles.cache.has(verifiedRole)) {
            return await interaction.reply({
                content: 'This command isn\'t allowed to be used by non-verified users.',
                ephemeral: true
            });
        }
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        await interaction.editReply(`:heartbeat: ${interaction.client.ws.ping}ms\n:repeat: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }
}