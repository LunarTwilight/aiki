import { EmbedBuilder, AuditLogEvent, GuildMember } from 'discord.js';
import db from '../database.js';
import parseDuration from 'parse-duration';
import humanizeDuration from 'humanize-duration';

const config = db.prepare('SELECT modLogChannel FROM config WHERE guildId = ?');

module.exports = {
    name: 'guildMemberUpdate',
    async execute (_oldUser: GuildMember, newUser: GuildMember) {
        if (!newUser.isCommunicationDisabled()) {
            return;
        }
        const fetchedLogs = await newUser.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberUpdate
        });
        const log = fetchedLogs.entries.first();
        const firstChange = log?.changes[0];
        if (!log || log.target?.id !== newUser.user.id || firstChange?.key !== 'communication_disabled_until' || !firstChange.new) {
            return;
        }

        const timestamp = new Date(firstChange.new as number).getTime();
        const diff = timestamp - new Date().getTime();
        const mDiff = parseDuration(`${ diff }`, 'm') ?? 0;
        const roundedDiff = Math.round(mDiff);
        const msDiff = parseDuration(roundedDiff + 'm', 'ms') ?? 0;
        const { modLogChannel } = config.get(newUser.guild.id) as {
            modLogChannel: string
        };
        const embed = new EmbedBuilder()
            .setTitle('User muted')
            .addFields([{
                name: 'User',
                value: `<@${newUser.user.id}>`,
                inline: true
            }, {
                name: 'Mod',
                value: (log?.executor ? `<@${log.executor.id}>` : 'N/A'),
                inline: true
            }, {
                name: 'Duration',
                value: humanizeDuration(msDiff),
                inline: true
            }, {
                name: 'Expiry',
                value: `<t:${Math.floor((timestamp / 1000))}>`,
                inline: true
            }, {
                name: 'Reason',
                value: log.reason || 'N/A',
                inline: true
            }]);
        
        const channel = await newUser.client.channels.fetch(modLogChannel);
        if (!channel?.isTextBased()) return;
        await channel.send({
            embeds: [
                embed
            ]
        });
    }
};