const cron = require('node-cron');
const db = require('./database.js');
const getIgnoredUsers = db.prepare('SELECT userId FROM renameNoticeIgnore WHERE expiry > ?');
const removeIgnoreUserRow = db.prepare('DELETE FROM renameNoticeIgnore WHERE userId = ?');

module.exports = {
    execute () {
        cron.schedule('0/30 * * * *', () => {
            getIgnoredUsers.all(Date.now()).forEach(row => {
                removeIgnoreUserRow.run(row.userId);
            });
        });
    }
}