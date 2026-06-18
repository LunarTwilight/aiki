const db = require('../database.js');
const getConfig = require('../config.js');
const getResponse = db.prepare('SELECT response, modOnly FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['!wiki', '!report', '!soap'];

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { verifiedRole } = getConfig(message.guild.id);
        if (
            !message.content.startsWith('!') ||
            excluded.some(prefix => message.content.startsWith(prefix)) ||
            !message.member.roles.cache.has(verifiedRole)
        ) {
            return;
        }
        const msg = message.content.slice(1).replace(/(.\S+).*/, '$1').trim();
        const row = getResponse.get(message.guild.id, msg);
        if (!row?.response || (
            !message.member.isMod && row?.modOnly
        )) {
            return;
        }
        await message.channel.send(row.response);
    }
};