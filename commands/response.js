const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, verifiedRole FROM config WHERE guildId = ?');
const getResponse = db.prepare('SELECT response FROM customResponses WHERE guildId = ? AND trigger = ?');
const addResponse = db.prepare('INSERT INTO customResponses (trigger, response, guildId) VALUES (?, ?, ?)');
const editResponse = db.prepare('UPDATE customResponses SET response = ? WHERE trigger = ? AND guildId = ?');
const deleteResponse = db.prepare('DELETE FROM customResponses WHERE guildId = ? AND trigger = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('response')
        .setDescription('Control custom responses from the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('print')
                .setDescription('Prints out the current response to a specified trigger')
                .addStringOption(trigger =>
                    trigger
                        .setName('name')
                        .setDescription('The name of the trigger')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds a new custom response to the bot')
                .addStringOption(trigger =>
                    trigger
                        .setName('name')
                        .setDescription('The name of the trigger')
                        .setRequired(true)
                )
                .addStringOption(response =>
                    response
                        .setName('content')
                        .setDescription('The message the bot will sent')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edits a custom response')
                .addStringOption(trigger =>
                    trigger
                        .setName('name')
                        .setDescription('The name of the trigger')
                        .setRequired(true)
                )
                .addStringOption(response =>
                    response
                        .setName('content')
                        .setDescription('The message the bot will sent')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Deletes a custom response')
                .addStringOption(trigger =>
                    trigger
                        .setName('name')
                        .setDescription('The name of the trigger')
                        .setRequired(true)
                )
        ),
    async execute (interaction) {
        const { modRole, verifiedRole } = config.all(interaction.guildId)[0];
        switch (interaction.options.getSubcommand()) {
            case 'print':
                if (!interaction.member.roles.cache.has(verifiedRole.toString())) { 
                    return interaction.reply({
                        content: 'This command can not be used by verified users',
                        ephemeral: true
                    });
                }
                const { response } = getResponse.run(interaction.guildId, interaction.options.getString('name'));
                interaction.reply('```\n' + response + '\n```');
                break;
            case 'add':
                if (!interaction.member.roles.cache.has(modRole.toString())) {
                    return interaction.reply({
                        content: 'You are not a mod, I\'d suggest you become one.',
                        ephemeral: true
                    });
                }
                addResponse.run(interaction.options.getString('name'), interaction.options.getString('content'), interaction.guildId);
                interaction.reply('Response added.');
                break;
            case 'edit':
                if (!interaction.member.roles.cache.has(modRole.toString())) {
                    return interaction.reply({
                        content: 'You are not a mod, I\'d suggest you become one.',
                        ephemeral: true
                    });
                }
                editResponse.run(interaction.options.getString('content'), interaction.options.getString('name'), interaction.guildId);
                interaction.reply('Reponse edited.');
                break;
            case 'delete':
                if (!interaction.member.roles.cache.has(modRole.toString())) {
                    return interaction.reply({
                        content: 'You are not a mod, I\'d suggest you become one.',
                        ephemeral: true
                    });
                }
                deleteResponse.run(interaction.guildId, interaction.options.getString('name'));
                interaction.reply('Response deleted.');
                break;
        }
    }
}