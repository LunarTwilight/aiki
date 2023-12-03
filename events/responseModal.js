const db = require('../database.js');
const addResponse = db.prepare('INSERT INTO customResponses (trigger, response, guildId) VALUES (?, ?, ?)');
const editResponse = db.prepare('UPDATE customResponses SET response = ? WHERE trigger = ? AND guildId = ?');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (interaction.isModalSubmit() && interaction.customId.startsWith('response-')) {
            const name = interaction.customId.match(/response-(?:add|edit)-(.*)/)[1];
            if (!name) {
                await interaction.reply('Error: no name set!');
                return;
            }
            if (interaction.customId.startsWith('response-add-')) {
                addResponse.run(name, interaction.fields.getTextInputValue('content'), interaction.guildId);
                await interaction.reply('Response added.');
            }
            if (interaction.customId.startsWith('reponse-edit-')) {
                editResponse.run(interaction.fields.getTextInputValue('content'), name, interaction.guildId);
                await interaction.reply('Response edited.');
            }
        }
    }
};