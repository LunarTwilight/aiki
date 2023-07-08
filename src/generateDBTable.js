const { ChannelType } = require('discord.js');
const db = require('./database.js');
const makeRow = db.prepare('INSERT INTO channelPositions (guildId, channelId, position) VALUES (?, ?, ?)');

module.exports = {
    async execute (interaction) {
        interaction.guild.channels.cache.each(channel => {
            if (channel.type === ChannelType.PublicThread) {
                return;
            }
            makeRow.run(interaction.guildId, channel.id, channel.position);
        });
        interaction.editReply('done');
    }
};