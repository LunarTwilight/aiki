const stringSimilarity = require('string-similarity');
const { renameLogChannel, randomChannel } = require('../config.json');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (!oldUser.nickname || !newUser.nickname || oldUser.nickname === newUser.nickname) {
            return;
        }
        const diff = stringSimilarity.compareTwoStrings(oldUser.nickname, newUser.nickname);
        if (diff < 0.3) {
            newUser.guild.channels.cache.get(randomChannel).send('<@' + newUser.user.id + '> please keep your nick as your Fandom username. Your nick change has been reverted.');
            newUser.setNickname(oldUser.nickname, 'Reverting nick change back to Fandom username');
        }
        newUser.guild.channels.cache.get(renameLogChannel).send(`<@${newUser.user.id}> changed their nick from \`${oldUser.nickname}\` to \`${newUser.nickname}\`\nSimilarity: ${diff}`);
    }
}