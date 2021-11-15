const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('die')
		.setDescription('Kills the bot (or restarts it)'),
	async execute(interaction) {
        await interaction.reply('bye');
        return process.exit();
	}
}