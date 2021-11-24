const cron = require('node-cron');
const { muteRole, modChannel, guildId } = require('./config.json');
const db = require('./database.js');
const getMutes = db.prepare('SELECT userid FROM mutes WHERE expiry < ?');
const removeMuteRow = db.prepare('DELETE FROM mutes WHERE userid = ?');

module.exports = {
    execute (client) {
        cron.schedule('0/15 * * * *', () => {
            const expiredMutes = getMutes.all(Date.now());
            expiredMutes.forEach(async row => {
                const user = await client.guilds.cache.get(guildId).members.fetch(row.userid.toString());
                if (user.roles.cache.has(muteRole)) {
                    user.roles.remove(muteRole);
                }
                await client.channels.cache.get(modChannel).send('<@' + row.userid + '> has been unmuted.');
                removeMuteRow.run(row.userid);
            });
        });
    }
}