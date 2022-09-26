const { ChannelType } = require('discord.js');
const db = require('../database.js');
const channelPositions = db.prepare('SELECT position FROM channelPositions WHERE guildId = ? AND channelId = ?');

module.exports = {
    name: 'channelUpdate',
    execute (oldChannel, newChannel) {
        if (oldChannel.type !== ChannelType.GuildText) {
            return;
        }

        const channelPosition = channelPositions.get(oldChannel.guildId, oldChannel.id);
        if (channelPosition && newChannel.position !== channelPosition.position) {
            newChannel.setPosition(channelPosition.position, {
                reason: 'Reverting possible accidental channel move'
            });
        }
    }
};