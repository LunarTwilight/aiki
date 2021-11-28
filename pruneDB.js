const cron = require('node-cron');
const config = require('./config.js');
const db = require('./database.js');
const getIgnoredUsers = db.prepare('SELECT userid, guildid FROM verificationIgnore');
const removeIgnoreUserRow = db.prepare('DELETE FROM verificationIgnore WHERE userId = ?');

module.exports = {
    execute (client) {
        cron.schedule('0/30 * * * *', () => {
            const ignoredUsers = getIgnoredUsers.all();
            ignoredUsers.forEach(async row => {
                const user = await client.guilds.cache.get(row.guildId.toString()).members.fetch(row.userId.toString());
                const role = config.find(item => item.guildId === row.guildId).verifiedRole.toString();
                if (!user || user.roles.cache.has(role)) {
                    removeIgnoreUserRow.run(row.userId);
                }
            });
        });
    }
}