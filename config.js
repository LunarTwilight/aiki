const db = require('./database.js');
const config = db.prepare('SELECT * FROM config').all();
module.exports = config;