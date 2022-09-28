const db = require('./database.js');
const cron = require('node-cron');
const channelPositions = db.prepare('SELECT channelId, position FROM channelPositions WHERE guildId = ?');

module.exports = {
    name: 'ready',
    once: true,
    async execute (client) {
        cron.schedule('0 * * * *', () => {
            client.guilds.cache.each(guild => {
                //https://stackoverflow.com/a/50951372
                const positions = channelPositions.all(guild.id).map(({
                    channelId,
                    ...rest
                }) => ({
                    channel: channelId,
                    ...rest
                }));

                guild.channels.setPositions(positions)
                    .then(() => {
                        console.log('Setting positions of channels.');
                    })
                    .catch(console.error);
            });
        });
    }
};