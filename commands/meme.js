const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('meme'),
    async execute (interaction) {
        const role = config.find(item => item.guildId === BigInt(interaction.guildId)).verifiedRole.toString()
        if (!interaction.member.roles.cache.has(role)) {
            return interaction.reply({
                content: 'This command isn\'t allowed to be used by non-verified users.',
                ephemeral: true
            });
        }
        interaction.reply('https://i.kym-cdn.com/photos/images/newsfeed/001/311/521/6be.gif');
    }
}