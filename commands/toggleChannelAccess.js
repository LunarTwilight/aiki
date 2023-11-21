const { SlashCommandBuilder } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modRole FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglechannelaccess')
        .setDescription('Toggles a channel between open and closed, assumes current channel if none specified')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Role to toggle access for')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName('read')
                .setDescription('Allow the role to read messages in the channel?')
        )
        .addBooleanOption(option =>
            option
                .setName('write')
                .setDescription('Allow the role to write messages?')
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to toggle premissions on')
        )
        .setDMPermission(false),
    async execute (interaction) {
        const { modRole } = config.get(interaction.guildId);
        if (interaction.member.roles.highest.comparePositionTo(modRole) < 0) {
            await interaction.reply({
                content: 'You are not a mod, I\'d suggest you become one.',
                ephemeral: true
            });
            return;
        }

        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const role = interaction.options.getRole('role');

        if (interaction.options.getBoolean('read') === undefined && interaction.options.getBoolean('write') === undefined) {
            const premissions = channel.permissionsFor(role);
            await interaction.reply({
                content: `${role}:\n*Read: ${premissions.has('ViewChannel')}\n*Write: ${premissions.has('SendMessages')}`,
                ephemeral: true
            });
            return;
        }

        let readToggled = null;
        let writeToggled = null;

        if (interaction.options.getBoolean('read')) {
            await channel.permissionOverwrites.edit(
                role,
                {
                    ViewChannel: interaction.options.getBoolean('read')
                },
                {
                    reason: `Requested by ${interaction.member.nickname || interaction.user.username}`
                }
            );
            readToggled = true;
        }

        if (interaction.options.getBoolean('write')) {
            await channel.permissionOverwrites.edit(
                role,
                {
                    SendMessages: interaction.options.getBoolean('write')
                },
                {
                    reason: `Requested by ${interaction.member.nickname || interaction.user.username}`
                }
            );
            writeToggled = true;
        }

        let start;
        if (readToggled && !writeToggled) {
            start = 'Read';
        } else if (!readToggled && writeToggled) {
            start = 'Write';
        } else {
            start = `Read and write`;
        }

        await interaction.reply({
            content: `${start} access has been toggled for ${role} in <#${channel.id}>`,
            ephemeral: true
        });
    }
};