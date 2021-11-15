const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('posts a link to zendesk'),
	async execute(interaction) {
        interaction.reply('https://fandom.zendesk.com/hc/requests/new');
	}
}