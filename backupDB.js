const cron = require('node-cron');

module.exports = {
    execute (db) {
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