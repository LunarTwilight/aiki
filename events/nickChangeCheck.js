const stringSimilarity = require('string-similarity');
const needle = require('needle');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel, generalChannel, modRole FROM config WHERE guildId = ?');
const addIgnore = db.prepare('INSERT INTO renameNoticeIgnore (userId, guildId, expiry) VALUES (?, ?, ?)')

const revertNick = (newUser, generalChannel, target, oldNick) => {
    newUser.guild.channels.cache.get(generalChannel).send('<@' + target.id + '> please keep your nick close to your Fandom username. Your nick change has been reverted. If you have changed your Fandom username, please contact a mod to change your nick here.');
    newUser.setNickname(oldNick, 'Reverting nick change back to Fandom username');
    addIgnore.run(newUser.id, newUser.guild.id, (Date.now() + (24 * 60 * 60 * 1000)));
}

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
        if (executor.bot || target.id !== newUser.id || !changes.some(item => item.key === 'nick') || (Date.now() - createdTimestamp) > (60 * 1000)) {
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
        const modChanged = newUser.guild.members.cache.get(executor.id).roles.highest.comparePositionTo(modRole) >= 0;
        if (modChanged) {
            wording = `had their nick ${newNick ? 'changed' : 'removed'}`;
        }
        newUser.guild.channels.cache.get(renameLogChannel).send(`<@${target.id}> ${wording}.\nOld nick: \`${oldNick}\`\n${newNick ? 'New nick' : 'Username'}: \`${newName}\`\nSimilarity: ${diff}`);
        if (diff < 0.3 && !modChanged) {
            needle.request('get', 'https://community.fandom.com/api.php', {
                action: 'query',
                list: 'users',
                ususers: newName,
                format: 'json'
            }, (err, res, body) => {
                if (err) {
                    return console.error(err);
                }
                if (body.error) {
                    return console.error(body.error);
                }
                if (body.query?.users[0]?.userid) {
                    needle.request('get', 'https://services.fandom.com/user-attribute/user/' + body.query.users[0].userid + '/attr/discordHandle', {
                        json: true
                    }, (error, resp, bod) => {
                        if (error) {
                            return console.error(error);
                        }
                        if (!bod?.value || bod.value !== (newName + '#' + newUser.user.discriminator)) {
                            revertNick(newUser, generalChannel, target, oldNick);
                        }
                    });
                } else {
                    revertNick(newUser, generalChannel, target, oldNick);
                }
            });
        }
    }
}