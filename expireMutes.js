const cron = require('node-cron');
const { muteRole, modChanel } = require('./config.json');
const db = require('./database.js');

module.exports = {
    execute (client) {
        const getMutes = db.prepare('SELECT userid FROM mutes WHERE expiry < ?');
        const removeMuteRow = db.prepare('DELETE FROM mutes WHERE userid = ?');
        cron.schedule('0/15 * * * *', () => {
            const expiredMutes = getMutes.all(Date.now());
            expiredMutes.forEach(async row => {
                client.users.fetch(row.userid).roles.remove(muteRole);
                client.channels.fetch(modChanel).send('<@' + row.userid + '> has been unmuted.');
                removeMuteRow.run(row.userid);
            });
        });
    }
}