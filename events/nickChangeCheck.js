const stringSimilarity = require('string-similarity');
const db = require('../database.js');
const config = db.prepare('SELECT renameLogChannel, randomChannel FROM config WHERE guildId = ?');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (!oldUser.nickname || !newUser.nickname || oldUser.nickname === newUser.nickname) {
            return;
        }
        const diff = stringSimilarity.compareTwoStrings(oldUser.nickname, newUser.nickname);
        const { renameLogChannel, randomChannel } = config.all(BigInt(newUser.guild.id))[0];
        if (diff < 0.3) {
            newUser.guild.channels.cache.get(randomChannel).send('<@' + newUser.user.id + '> please keep your nick as your Fandom username. Your nick change has been reverted.');
            newUser.setNickname(oldUser.nickname, 'Reverting nick change back to Fandom username');
        }
        newUser.guild.channels.cache.get(renameLogChannel).send(`<@${newUser.user.id}> changed their nick from \`${oldUser.nickname}\` to \`${newUser.nickname}\`\nSimilarity: ${diff}`);
    }
}