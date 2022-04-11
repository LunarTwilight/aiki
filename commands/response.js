const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT modRole, verifiedRole FROM config WHERE guildId = ?');
const getResponses = db.prepare('SELECT trigger FROM customResponses WHERE guildId = ?');
const getResponse = db.prepare('SELECT response FROM customResponses WHERE guildId = ? AND trigger = ?');
const addResponse = db.prepare('INSERT INTO customResponses (trigger, response, guildId) VALUES (?, ?, ?)');
const editResponse = db.prepare('UPDATE customResponses SET response = ? WHERE trigger = ? AND guildId = ?');
const deleteResponse = db.prepare('DELETE FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['!wiki', '!report', '!soap'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('response')
        .setDescription('Control custom responses from the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lists all custom response triggers registered')
        )
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
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
            return;
        }
        const { modRole, verifiedRole } = config.all(interaction.guildId)[0];
        const response = getResponse.get(interaction.guildId, interaction.options.getString('name'))?.response;
        const command = interaction.options.getSubcommand();
        if (/list|print/.test(command) && !interaction.member.roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: 'This command can not be used by non-verified users.',
                ephemeral: true
            });
            return;
        }
        if (!/list|print/.test(command) && interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
            return;
        }
        switch (command) {
            case 'list': {
                const list = getResponses.all(interaction.guildId).map(item => item.trigger);
                await interaction.reply('My registered custom responses are:\n```' + list.join(', ') + '```');
                break;
            }
            case 'print': {
                if (!response) {
                    await interaction.reply('This reposnse doesn\'t exist!');
                    break;
                }
                await interaction.reply('```\n' + response + '\n```');
                break;
            }
            case 'add':
                if (excluded.some(prefix => interaction.options.getString('name').startsWith(prefix))) {
                    await interaction.reply({
                        content: 'Trigger name is not allowed to be used, please select a different name.',
                        ephemeral: true
                    });
                    return;
                }
                addResponse.run(interaction.options.getString('name'), interaction.options.getString('content'), interaction.guildId);
                await interaction.reply('Response added.');
                break;
            case 'edit':
                if (!response) {
                    await interaction.reply('This response doesn\'t exist!');
                    break;
                }
                editResponse.run(interaction.options.getString('content'), interaction.options.getString('name'), interaction.guildId);
                await interaction.reply('Response edited.');
                break;
            case 'delete':
                if (!response) {
                    await interaction.reply('This response doesn\'t exist!');
                    break;
                }
                deleteResponse.run(interaction.guildId, interaction.options.getString('name'));
                await interaction.reply('Response deleted.');
                break;
        }
    }
};