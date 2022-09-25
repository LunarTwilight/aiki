const db = require('../database.js');
const channelPositions = db.prepare('SELECT position FROM channelPositions WHERE guildId = ? AND channelId = ?');

module.exports = {
    name: 'channelUpdate',
    execute (oldChannel, newChannel) {
        if (
            oldChannel.isDMBased() ||
            !oldChannel.isTextBased() ||
            oldChannel.isThread() ||
            oldChannel.isVoiceBased()
        ) {
            return;
        }

        const channelPosition = channelPositions.get(oldChannel.guildId, oldChannel.id);
        if (!channelPosition || !channelPosition.position) {
            return;
        }
        if (newChannel.position !== channelPosition.position) {
            newChannel.setPosition(channelPosition.position, {
                reason: 'Reverting possible accidental channel move'
            });
        }
    }
};