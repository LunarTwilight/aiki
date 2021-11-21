const cron = require('node-cron');
const db = require('./database.js');
const fs = require('fs');

if (!fs.existsSync('./backups')) {
    fs.mkdirSync('./backups');
}

module.exports = {
    execute () {
        cron.schedule('0 * * * *', () => {
            db.backup(`/backups/backup-${Date.now()}.sqlite`)
                .then(() => {
                    console.log('backup complete!');
                })
                .catch(err => {
                    console.log('backup failed:', err);
                });
        });
    }
}