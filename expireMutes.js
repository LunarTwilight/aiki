const cron = require('node-cron');
const { muteRole, modChanel, guildId } = require('./config.json');
const db = require('./database.js');
const getMutes = db.prepare('SELECT userid FROM mutes WHERE expiry < ?');
const removeMuteRow = db.prepare('DELETE FROM mutes WHERE userid = ?');

module.exports = {
    execute (client) {
        cron.schedule('0/15 * * * *', () => {
            const expiredMutes = getMutes.all(Date.now());
            expiredMutes.forEach(async row => {
                client.guilds.cache.get(guildId).members.cache.get(row.userid.toString()).roles.remove(muteRole);
                client.channels.fetch(modChanel).send('<@' + row.userid + '> has been unmuted.');
                removeMuteRow.run(row.userid);
            });
        });
    }
}