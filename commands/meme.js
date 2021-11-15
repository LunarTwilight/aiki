const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('meme'),
	async execute(interaction) {
        interaction.reply('https://i.kym-cdn.com/photos/images/newsfeed/001/311/521/6be.gif');
	}
}