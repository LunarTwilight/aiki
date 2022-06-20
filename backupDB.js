const cron = require('node-cron');
const db = require('./database.js');
const fs = require('fs');

module.exports = {
    execute () {
        if (!fs.existsSync('./backups')) {
            fs.mkdirSync('./backups');
        }

        cron.schedule('0 * * * *', async () => {
            await db.backup(`./backups/backup-${Date.now()}.sqlite`)
                .catch(err => {
                    console.error('backup failed: ', err);
                });
        });
    }
};