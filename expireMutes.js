const cron = require('node-cron');
const config = require('./config.js');
const db = require('./database.js');
const getMutes = db.prepare('SELECT userId, guildId FROM mutes WHERE expiry < ?');
const removeMuteRow = db.prepare('DELETE FROM mutes WHERE userId = ?');

module.exports = {
    execute (client) {
        cron.schedule('0/15 * * * *', () => {
            const expiredMutes = getMutes.all(Date.now());
            expiredMutes.forEach(async row => {
                const user = await client.guilds.cache.get(row.guildId.toString()).members.fetch(row.userId.toString());
                const guildConfig = config.find(item => item.guildId === row.guildId);
                if (user.roles.cache.has(guildConfig.muteRole.toString())) {
                    user.roles.remove(guildConfig.muteRole.toString());
                }
                await client.channels.cache.get(guildConfig.modChannel.toString()).send('<@' + row.userId.toString() + '> has been unmuted.');
                removeMuteRow.run(row.userId);
            });
        });
    }
}