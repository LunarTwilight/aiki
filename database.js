const Database = require('better-sqlite3');
const db = new Database('db.sqlite', {
    fileMustExist: true
});
db.defaultSafeIntegers(true);
module.exports = db;