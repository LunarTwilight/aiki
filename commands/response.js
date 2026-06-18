const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, LabelBuilder, ButtonBuilder, ButtonStyle, CheckboxBuilder } = require('discord.js');
const db = require('../database.js');
const getResponses = db.prepare('SELECT trigger, modOnly FROM customResponses WHERE guildId = ?');
const getResponse = db.prepare('SELECT response, modOnly FROM customResponses WHERE guildId = ? AND trigger = ?');
const deleteResponse = db.prepare('DELETE FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['wiki', 'report', 'soap'];

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
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads),
    async execute (interaction) {
        const command = interaction.options.getSubcommand();
        const name = interaction.options.getString('name')?.replace(/(.\S+).*/, '$1').trim();
        let response = null;
        let modOnly = null;
        if (command !== 'list') {
            response = getResponse.get(interaction.guildId, name)?.response;
            modOnly = Boolean(getResponse.get(interaction.guildId, name)?.modOnly);
        }
        if (!/list|print/.test(command) && interaction.member.isMod) {
            await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
            return;
        }
        switch (command) {
            case 'list': {
                const list = getResponses.all(interaction.guildId).map(item => {
                    let str = item.trigger;
                    if (item.modOnly) {
                        str += '*';
                    }
                    return str;
                });
                await interaction.reply('My registered custom responses are:\n```' + list.join(', ') + '```\n_commands with "*" are mod only_');
                break;
            }
            case 'print': {
                if (!response) {
                    await interaction.reply('This reposnse doesn\'t exist!');
                    break;
                }
                let str = '```\n' + response + '\n```';
                if (modOnly) {
                    str += '\n_command is mod only_';
                }
                await interaction.reply(str);
                break;
            }
            case 'add': {
                if (excluded.some(prefix => name.startsWith(prefix))) {
                    await interaction.reply({
                        content: 'Trigger name is not allowed to be used, please select a different name.',
                        ephemeral: true
                    });
                    return;
                }
                if (response) {
                    await interaction.reply({
                        content: 'Response already exists!',
                        ephemeral: true
                    });
                    return;
                }

                const modal = new ModalBuilder()
                    .setCustomId(`response-add-${name}`)
                    .setTitle(`Adding custom response for "${name}"`);

                const contentLabel = new LabelBuilder()
                    .setLabel('Response content')
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId('content')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('Add some text!')
                            .setRequired(true)
                    );

                const checkboxLabel = new LabelBuilder()
                    .setLabel('Mod only?')
                    .setCheckboxComponent(
                        new CheckboxBuilder()
                            .setCustomId('modonly')
                            .setDefault(false)
                    );

                modal.addComponents(contentLabel, checkboxLabel);
                await interaction.showModal(modal);
                break;
            }
            case 'edit': {
                if (!response) {
                    await interaction.reply('This response doesn\'t exist!');
                    break;
                }

                const modal = new ModalBuilder()
                    .setCustomId(`response-edit-${name}`)
                    .setTitle(`Editing custom response for "${name}"`);

                const contentLabel = new LabelBuilder()
                    .setLabel('Response content')
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId('content')
                            .setStyle(TextInputStyle.Paragraph)
                            .setValue(response)
                            .setRequired(true)
                    );

                const checkboxLabel = new LabelBuilder()
                    .setLabel('Mod only?')
                    .setCheckboxComponent(
                        new CheckboxBuilder()
                            .setCustomId('modonly')
                            .setDefault(modOnly)
                    );

                modal.addComponents(contentLabel, checkboxLabel);
                await interaction.showModal(modal);
                break;
            }
            case 'delete': {
                if (!response) {
                    await interaction.reply('This response doesn\'t exist!');
                    break;
                }

                const confirm = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Delete')
                    .setStyle(ButtonStyle.Danger);

                const cancel = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(cancel, confirm);

                const reply = await interaction.reply({
                    content: `Are you sure you want to delete the response for "${name}"?`,
                    components: [row],
                    ephemeral: true
                });

                try {
                    const confirmation = await reply.awaitMessageComponent({
                        filter: i => i.user.id === interaction.user.id,
                        time: 60_000
                    });

                    if (confirmation.customId === 'confirm') {
                        deleteResponse.run(interaction.guildId, name);
                        await confirmation.update({
                            content: `The response "${name}" has been deleted`,
                            components: []
                        });
                    } else if (confirmation.customId === 'cancel') {
                        await confirmation.update({
                            content: 'Action cancelled',
                            components: []
                        });
                    }
                } catch {
                    await interaction.editReply({
                        content: 'Confirmation not received within 1 minute, cancelling',
                        components: []
                    });
                }

                break;
            }
        }
    }
};