const db = require('../database.js');
const channelPositions = db.prepare('SELECT position FROM channelPositions WHERE guildId = ? AND channelId = ?');
let cooldown = false;

module.exports = {
    name: 'channelUpdate',
    execute (oldChannel, newChannel) {
        if (oldChannel.type !== 'GUILD_TEXT' || cooldown) {
            return;
        }

        const channelPosition = channelPositions.get(oldChannel.guildId, oldChannel.id);
        if (channelPosition && newChannel.position !== channelPosition.position) {
            newChannel.setPosition(channelPosition.position, {
                reason: 'Reverting possible accidental channel move'
            });
            cooldown = true;
            setTimeout(() => {
                cooldown = false;
            }, 10000);
        }
    }
};