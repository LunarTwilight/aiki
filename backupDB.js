const cron = require('node-cron');
const db = require('./database.js');
const fs = require('fs');

module.exports = {
    execute () {
        if (!fs.existsSync('./backups')) {
            fs.mkdirSync('./backups');
        }
        cron.schedule('0 * * * *', () => {
            db.backup(`./backups/backup-${Date.now()}.sqlite`)
                .then(() => {
                    console.log('backup complete!');
                })
                .catch(err => {
                    console.error('backup failed:', err);
                });
        });
    }
}