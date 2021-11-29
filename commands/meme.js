const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('meme'),
    async execute (interaction) {
        const { verifiedRole } = config.get(BigInt(interaction.guildId));
        if (!interaction.member.roles.cache.has(verifiedRole.toString())) {
            return interaction.reply({
                content: 'This command isn\'t allowed to be used by non-verified users.',
                ephemeral: true
            });
        }
        interaction.reply('https://i.kym-cdn.com/photos/images/newsfeed/001/311/521/6be.gif');
    }
}