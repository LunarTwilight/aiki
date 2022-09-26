const { EmbedBuilder } = require('discord.js');
const stringSimilarity = require('string-similarity');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel, verifiedRole FROM config WHERE guildId = ?');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (oldUser.user.username !== newUser.user.username) {
            console.log(oldUser, newUser);
        }
        const { renameLogChannel, verifiedRole } = config.get(newUser.guild.id);
        if (oldUser.nickname || newUser.nickname || !newUser.manageable || !oldUser.roles.cache.has(verifiedRole) || oldUser.user.username === newUser.user.username) {
            return;
        }
        const diff = stringSimilarity.compareTwoStrings(oldUser.user.username.toLowerCase(), newUser.user.username.toLowerCase());
        const embed = new EmbedBuilder()
            .setTitle('User changed username')
            .addFields([{
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
                value: diff.toString(),
                inline: true
            }, {
                name: 'Set nick?',
                value: (diff < 0.3 ? 'Yes' : 'No'),
                inline: true
            }]);
        if (diff < 0.3) {
            await newUser.setNickname(oldUser.user.username, 'New username not similar to old username');
        }
        await newUser.client.channels.cache.get(renameLogChannel).send({
            embeds: [
                embed
            ]
        });
    }
};