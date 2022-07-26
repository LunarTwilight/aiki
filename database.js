const Database = require('better-sqlite3');
const db = new Database(__dirname + '/db.sqlite', {
    fileMustExist: true
});
db.defaultSafeIntegers(true);
module.exports = db;