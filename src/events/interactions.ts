import { Collection, Interaction } from 'discord.js';

export default {
    name: 'interactionCreate',
    async execute (interaction: Interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const { commands } = interaction.client as unknown as {
            commands: Collection<string, {
                execute: Function
            }>
        };
        const command = commands.get(interaction.commandName);

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
};