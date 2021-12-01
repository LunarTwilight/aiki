const stringSimilarity = require('string-similarity');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel, randomChannel, modRole FROM config WHERE guildId = ?');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (!oldUser.nickname) {
            return;
        }
        const { renameLogChannel, randomChannel, modRole } = config.all(BigInt(newUser.guild.id))[0];
        const newName = newUser.nickname ? newUser.nickname : newUser.user.username;
        const diff = stringSimilarity.compareTwoStrings(oldUser.nickname, newName);
        const fetchedLogs = await newUser.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_UPDATE'
        });
        const log = fetchedLogs.entries.first();
        if (log) {
            const { executor } = log;
            console.log(newUser.guild.members.cache.get(executor.id).roles.cache.has(modRole.toString()));
        }
        if (diff < 0.3) {
            newUser.guild.channels.cache.get(randomChannel.toString()).send('<@' + newUser.user.id + '> please keep your nick as your Fandom username. Your nick change has been reverted.');
            newUser.setNickname(oldUser.nickname, 'Reverting nick change back to Fandom username');
        }
        newUser.guild.channels.cache.get(renameLogChannel.toString()).send(`<@${newUser.user.id}> ${newUser.nickname ? 'changed' : 'removed'} their nick.\nOld nick: \`${oldUser.nickname}\`\n${newUser.nickname ? 'New nick' : 'Username'}:\`${newName}\`\nSimilarity: ${diff}`);
    }
}