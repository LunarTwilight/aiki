const { MessageEmbed } = require('discord.js');
const stringSimilarity = require('string-similarity');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel FROM config WHERE guildId = ?');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (oldUser.nickname || newUser.nickname || !newUser.manageable) {
            return;
        }
        const diff = stringSimilarity.compareTwoStrings(oldUser.user.username.toLowerCase(), newUser.user.username.toLowerCase());
        const { renameLogChannel } = config.get(newUser.guild.id);
        const embed = new MessageEmbed()
            .setTitle('User changed username')
            .addFields({
                name: 'User',
                value: '<@' + newUser.user.id + '>',
                inline: true
            }, {
                name: 'Old username',
                value: oldUser.user.username,
                inline: true
            }, {
                name: 'New username',
                value: newUser.user.username,
                inline: true
            }, {
                name: 'Similarity',
                value: diff,
                inline: true
            });
        if (diff < 0.3) {
            await newUser.setNickname(oldUser.user.username, 'New username not similar to old username');
            embed.addField('Set nick?', 'Yes', true);
        } else {
            embed.addField('Set nick?', 'No', true);
        }
        await newUser.client.channels.cache.get(renameLogChannel).send({
            embeds: [
                embed
            ]
        });
    }
};