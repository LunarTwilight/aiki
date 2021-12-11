const { whatEmoji } = require('../config.json');
const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');
const getResponse = db.prepare('SELECT response FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['!wiki', '!report', '!soap', '!yes', '!no'];

module.exports = {
    name: 'messageCreate',
    execute (message) {
        const { verifiedRole } = config.get(message.guild.id);
        if (!message.content.startsWith('!') || excluded.some(prefix => message.content.startsWith(prefix)) || !message.member.roles.cache.has(verifiedRole.toString())) {
            return;
        }
        const row = getResponse.get(message.guild.id, message.content.slice(1));
        if (!row || !row.response) {
            message.react(whatEmoji);
            return;
        }
        message.channel.send(row.response);
    }
};