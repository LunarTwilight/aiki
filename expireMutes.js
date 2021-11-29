const cron = require('node-cron');
const db = require('./database.js');
const config = db.prepare('SELECT muteRole, modChannel FROM config WHERE guildId = ?');
const getMutes = db.prepare('SELECT userId, guildId FROM mutes WHERE expiry < ?');
const removeMuteRow = db.prepare('DELETE FROM mutes WHERE userId = ?');

module.exports = {
    execute (client) {
        cron.schedule('0/15 * * * *', () => {
            const expiredMutes = getMutes.all(Date.now());
            expiredMutes.forEach(async row => {
                const user = await client.guilds.cache.get(row.guildId.toString()).members.fetch(row.userId.toString());
                const { muteRole, modChannel } = config.all(row.guildId)[0];
                if (user.roles.cache.has(muteRole.toString())) {
                    user.roles.remove(muteRole.toString());
                }
                await client.channels.cache.get(modChannel.toString()).send('<@' + row.userId.toString() + '> has been unmuted.');
                removeMuteRow.run(row.userId);
            });
        });
    }
}