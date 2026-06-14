const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const getConfig = require('../config.js');
const humanizeDuration = require('humanize-duration');

module.exports = {
    name: 'guildAuditLogEntryCreate',
    async execute (auditLogEntry, guild) {
        const { action, changes, createdTimestamp, executorId, reason, targetId } = auditLogEntry;
        const { modLogChannel } = getConfig(guild.id);

        if (action !== AuditLogEvent.MemberUpdate) {
            return;
        }

        const entry = changes.find(item => item.key === 'communication_disabled_until');
        if (!entry) {
            return;
        }

        const timestamp = new Date((entry.new || entry.old)).getTime();
        const length = timestamp - createdTimestamp;
        const embed = new EmbedBuilder();
        embed.setTitle((entry.new ? 'User muted' : 'User unmuted'));
        embed.addFields([{
            name: 'User',
            value: `<@${targetId}>`,
            inline: true
        }, {
            name: 'Mod',
            value: `<@${executorId}>`,
            inline: true
        }, {
            name: (entry.new ? 'Duration' : 'Remaining length'),
            value: humanizeDuration(length, {
                round: true,
                largest: 2,
                units: (entry.new && length < 59500 ? ['s'] : ['d', 'h', 'm'])
            }),
            inline: true
        }, {
            name: 'Expiry',
            value: `<t:${Math.floor((timestamp / 1000))}>`,
            inline: true
        }]);
        if (entry.new) {
            embed.addFields([{
                name: 'Reason',
                value: (reason || 'N/A'),
                inline: true
            }]);
        }
        await guild.channels.cache.get(modLogChannel).send({
            embeds: [
                embed
            ]
        });
    }
};