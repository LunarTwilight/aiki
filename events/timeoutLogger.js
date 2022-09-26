const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modLogChannel FROM config WHERE guildId = ?');
const parseDuration = require('parse-duration');
const humanizeDuration = require('humanize-duration');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (!newUser.isCommunicationDisabled()) {
            return;
        }
        const fetchedLogs = await newUser.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberUpdate
        });
        const log = fetchedLogs.entries.first();
        if (!log || log.target.id !== newUser.user.id || log.changes[0].key !== 'communication_disabled_until') {
            return;
        }

        const timestamp = new Date(log.changes[0].new).getTime();
        const diff = timestamp - new Date().getTime();
        const mDiff = parseDuration(diff, 'm');
        const roundedDiff = Math.round(mDiff);
        const msDiff = parseDuration(roundedDiff + 'm', 'ms');
        const { modLogChannel } = config.get(newUser.guild.id);
        const embed = new EmbedBuilder()
            .setTitle('User muted')
            .addFields([{
                name: 'User',
                value: '<@' + newUser.user.id + '>',
                inline: true
            }, {
                name: 'Mod',
                value: (log?.executor ? '<@' + log.executor.id + '>' : 'N/A'),
                inline: true
            }, {
                name: 'Duration',
                value: humanizeDuration(msDiff),
                inline: true
            }, {
                name: 'Expiry',
                value: '<t:' + Math.floor((timestamp / 1000)) + '>',
                inline: true
            }, {
                name: 'Reason',
                value: log.reason || 'N/A',
                inline: true
            }]);
        await newUser.client.channels.cache.get(modLogChannel).send({
            embeds: [
                embed
            ]
        });
    }
};