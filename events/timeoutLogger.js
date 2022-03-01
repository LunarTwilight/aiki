const { MessageEmbed } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modLogChannel FROM config WHERE guildId = ?');
const parseDuration = require('parse-duration');
const humanizeDuration = require('humanize-duration');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (oldUser, newUser) {
        if (!newUser.communicationDisabledUntilTimestamp) {
            return;
        }
        const diff = newUser.communicationDisabledUntilTimestamp - new Date().getTime();
        const mDiff = parseDuration(diff, 'm');
        const roundedDiff = Math.round(mDiff);
        const msDiff = parseDuration(roundedDiff + 'm', 'ms');

        let reason;
        const fetchedLogs = await newUser.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_UPDATE',
        });
        const log = fetchedLogs.entries.first();
        if (!log || log.target.id !== newUser.user.id || log.changes[0].key !== 'communication_disabled_until' || !log.reason) {
            reason = 'N/A';
        } else {
            reason = log.reason;
        }

        const { modLogChannel } = config.get(newUser.guild.id);
        const embed = new MessageEmbed()
            .setTitle('User muted')
            .addFields({
                name: 'User',
                value: '<@' + newUser.user.id + '>',
                inline: true
            }, {
                name: 'Mod',
                value: '<@' + log.executor.id + '>',
                inline: true
            }, {
                name: 'Duration',
                value: humanizeDuration(msDiff),
                inline: true
            }, {
                name: 'Expiry',
                value: '<t:' + Math.floor((newUser.communicationDisabledUntilTimestamp / 1000)) + '>',
                inline: true
            }, {
                name: 'Reason',
                value: reason,
                inline: true
            });
        await newUser.client.channels.cache.get(modLogChannel).send({
            embeds: [
                embed
            ]
        });
    }
};