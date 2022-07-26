const db = require('./database.js');
const fs = require('fs');

(async () => {
    if (!fs.existsSync(__dirname + '/backups')) {
        fs.mkdirSync(__dirname + '/backups');
    }

    await db.backup(`${__dirname}/backups/backup-${Date.now()}.sqlite`)
        .catch(err => {
            console.error('backup failed: ', err);
        });
})();