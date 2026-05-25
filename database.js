const Database = require('better-sqlite3');
const db = new Database(__dirname + '/db.sqlite', {
    fileMustExist: true
});
//db.defaultSafeIntegers(true);

//https://github.com/WiseLibs/better-sqlite3/blob/d8885f900cb626596e28a0ecd1b9d35bf15c7a0b/docs/api.md#close---this
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = db;