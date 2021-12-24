const stringSimilarity = require('string-similarity');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel, generalChannel, modRole FROM config WHERE guildId = ?');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        const fetchedLogs = await newUser.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_UPDATE'
        });
        const log = fetchedLogs.entries.first();
        if (!log) {
            return;
        }
        const { executor, target, changes, createdTimestamp } = log;
        if (executor.bot || !changes.some(item => item.key === 'nick') || (Date.now() - createdTimestamp) > (60 * 1000)) {
            return;
        }
        const { old: oldNick, new: newNick } = changes.find(item => item.key === 'nick');
        if (!oldNick || oldNick === newNick) {
            return;
        }
        const newName = newNick || target.username;
        const diff = stringSimilarity.compareTwoStrings(oldNick.toLowerCase(), newName.toLowerCase());
        let wording = `${newNick ? 'changed' : 'removed'} their nick`;
        const { renameLogChannel, generalChannel, modRole } = config.all(newUser.guild.id)[0];
        const modChanged = newUser.guild.members.cache.get(executor.id).roles.cache.has(modRole);
        if (modChanged) {
            wording = `had their nick ${newNick ? 'changed' : 'removed'}`;
        }
        if (diff < 0.3 && !modChanged) {
            newUser.guild.channels.cache.get(generalChannel).send('<@' + target.id + '> please keep your nick as your Fandom username. Your nick change has been reverted.');
            newUser.setNickname(oldNick, 'Reverting nick change back to Fandom username');
        }
        newUser.guild.channels.cache.get(renameLogChannel).send(`<@${target.id}> ${wording}.\nOld nick: \`${oldNick}\`\n${newNick ? 'New nick' : 'Username'}: \`${newName}\`\nSimilarity: ${diff}`);
    }
}