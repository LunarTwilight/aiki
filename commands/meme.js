const { SlashCommandBuilder } = require('@discordjs/builders');
const { verifiedRole } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('meme'),
    async execute (interaction) {
        if (!interaction.member.roles.cache.has(verifiedRole)) {
            return interaction.reply({
                content: 'This command isn\'t allowed to be used by non-verified users.',
                ephemeral: true
            });
        }
        interaction.reply('https://i.kym-cdn.com/photos/images/newsfeed/001/311/521/6be.gif');
    }
}