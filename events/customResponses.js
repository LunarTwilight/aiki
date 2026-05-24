const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole, modRole FROM config WHERE guildId = ?');
const getResponse = db.prepare('SELECT response, modOnly FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['!wiki', '!report', '!soap'];

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { verifiedRole, modRole } = config.get(message.guild.id);
        if (
            !message.content.startsWith('!') ||
            excluded.some(prefix => message.content.startsWith(prefix)) ||
            !message.member.roles.cache.has(verifiedRole)
        ) {
            return;
        }
        const msg = message.content.slice(1).replace(/(.\S+).*/, '$1').trim();
        const row = getResponse.get(message.guild.id, msg);
        const isMod = message.member.roles.highest.comparePositionTo(modRole) >= 0;
        if (!row?.response || (
            !isMod && row?.modOnly
        )) {
            return;
        }
        await message.channel.send(row.response);
    }
};