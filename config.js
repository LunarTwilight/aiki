const { config } = require('./config.json');

const getConfig = serverId => config[serverId];

module.exports = getConfig;