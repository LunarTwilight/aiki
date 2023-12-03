const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const stringSimilarity = require('string-similarity');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Changes your nick (don\'t set a new nick to remove your nick)')
        .addStringOption(option =>
            option
                .setName('nick')
                .setDescription('Your new nick')
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads),
    async execute (interaction) {
        const { renameLogChannel } = config.get(interaction.guildId);
        if (!interaction.member.manageable) {
            await interaction.reply({
                content: 'Bot is unable to change your nick because you\'re higher than it, please use Discord\'s native nick change feature.',
                ephemeral: true
            });
            return;
        }
        if (interaction.member.nickname === interaction.options.getString('nick')) {
            await interaction.reply({
                content: 'You can not set your new nick to be the same as your old nick.',
                ephemeral: true
            });
            return;
        }
        if (!interaction.member.nickname && !interaction.options.getString('nick')) {
            await interaction.reply({
                content: 'You can not remove a nick you have not set.',
                ephemeral: true
            });
            return;
        }
        if (interaction.options.getString('nick')?.length > 32) {
            await interaction.reply({
                content: 'Your nick is too long, please shorten it to 32 characters or less.',
                ephemeral: true
            });
            return;
        }
        const newName = interaction.options.getString('nick') || interaction.member.user.username;
        const similarity = stringSimilarity.compareTwoStrings(interaction.member.displayName.toLowerCase(), newName.toLowerCase());
        const embed = new EmbedBuilder()
            .addFields({
                name: 'User',
                value: `<@${interaction.member.id}>`,
                inline: true
            }, {
                name: `Old ${interaction.member.nickname ? 'nick' : 'username'}`,
                value: interaction.member.displayName,
                inline: true
            }, {
                name: `New ${interaction.options.getString('nick') ? 'nick' : 'username'}`,
                value: newName,
                inline: true
            }, {
                name: 'Type',
                value () {
                    if (!interaction.options.getString('nick')) {
                        return 'remove';
                    }
                    if (!interaction.member.nickname) {
                        return 'set';
                    }
                    return 'change';
                },
                inline: true
            }, {
                name: 'Similarity',
                value: similarity.toString(),
                inline: true
            });
        if (similarity < 0.3) {
            embed.setDescription('Rejected due to similarity not meeting threshold of 0.3');
            embed.setTitle('Attempted nick update');
        } else {
            embed.setTitle('Nick update');
        }
        await interaction.client.channels.cache.get(renameLogChannel).send({
            embeds: [
                embed
            ]
        });
        if (similarity < 0.3) {
            await interaction.reply({
                content: 'Nick is not similar to your Fandom username, and has therefore not been changed. Please re-verify yourself using </verify:1126264839392735263> if your Fandom username has changed.',
                ephemeral: true
            });
        } else {
            await interaction.member.setNickname(newName, 'Requested by user');
            await interaction.reply({
                content: 'Your nick has been changed.',
                ephemeral: true
            });
        }
    }
};