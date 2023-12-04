const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (interaction.isButton() && interaction.customId === 'create-private-report-thread') {
            const modal = new ModalBuilder()
                .setCustomId(`create-private-report-thread`)
                .setTitle(`Please enter the title of your report`);

            const titleField = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Report title')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(titleField);
            modal.addComponents(row);

            await interaction.showModal(modal);

            await interaction.awaitModalSubmit({
                time: 60_000,
                filter: i => i.user.id === interaction.user.id
            })
                .then(async modalInteraction => {
                    await modalInteraction.reply(`thread title is ${modalInteraction.fields.getTextInputValue('title')}`);
                })
                .catch(async () => {
                    await interaction.followUp({
                        content: 'The modal was not submitted in time, or another error occured.',
                        ephemeral: true
                    });
                });
        }
    }
};