const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');
const getResponse = db.prepare('SELECT response FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['!wiki', '!report', '!soap'];

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { verifiedRole } = config.get(message.guild.id);
        if (
            !message.content.startsWith('!') ||
            excluded.some(prefix => message.content.startsWith(prefix)) ||
            !message.member.roles.cache.has(verifiedRole)
        ) {
            return;
        }
        const row = getResponse.get(message.guild.id, message.content.slice(1));
        if (!row?.response) {
            return;
        }
        await message.channel.send(row.response);
    }
};