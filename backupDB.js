const db = require('./database.js');
const fs = require('fs');

(async () => {
    if (!fs.existsSync('/root/aiki/backups')) {
        fs.mkdirSync('/root/aiki/backups');
    }

    await db.backup(`/root/aiki/backups/backup-${Date.now()}.sqlite`)
        .catch(err => {
            console.error('backup failed: ', err);
        });
})();