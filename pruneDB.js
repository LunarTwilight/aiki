const cron = require('node-cron');
const { verifiedRole, guildId } = require('./config.json');
const db = require('./database.js');
const getIgnoredUsers = db.prepare('SELECT userid FROM verificationIgnore');
const removeIgnoreUserRow = db.prepare('DELETE FROM verificationIgnore WHERE userid = ?');

module.exports = {
    execute (client) {
        cron.schedule('* * * * *', () => { //0/30 * * * *
            const ignoredUsers = getIgnoredUsers.all();
            ignoredUsers.forEach(async row => {
                const user = await client.guilds.cache.get(guildId).members.fetch(row.userid.toString());
                if (!user || user.roles.has(verifiedRole)) {
                    removeIgnoreUserRow.run(row.userid);
                }
            });
        });
    }
}