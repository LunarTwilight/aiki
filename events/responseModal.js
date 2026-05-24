const db = require('../database.js');
const addResponse = db.prepare('INSERT INTO customResponses (trigger, response, guildId, modOnly) VALUES (?, ?, ?, ?)');
const editResponse = db.prepare('UPDATE customResponses SET response = ?, modOnly = ? WHERE trigger = ? AND guildId = ?');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (interaction.isModalSubmit() && interaction.customId.startsWith('response-')) {
            const name = interaction.customId.match(/response-(?:add|edit)-(.*)/)[1];
            if (!name) {
                await interaction.reply('Error: no name set!');
                return;
            }
            const modonly = interaction.fields.getCheckbox('modonly') ? '1' : '0';
            if (interaction.customId.startsWith('response-add-')) {
                addResponse.run(name, interaction.fields.getTextInputValue('content'), interaction.guildId, modonly);
                await interaction.reply('Response added.');
            }
            if (interaction.customId.startsWith('response-edit-')) {
                editResponse.run(interaction.fields.getTextInputValue('content'), name, modonly, interaction.guildId);
                await interaction.reply('Response edited.');
            }
        }
    }
};