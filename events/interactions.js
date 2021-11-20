module.exports = {
    name: 'interactionCreate',
    async execute (interaction, db) {
        if (!interaction.isCommand()) {
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction, db);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
};