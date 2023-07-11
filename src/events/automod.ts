import parseDuration from 'parse-duration';
import { remove } from 'confusables';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import db from '../database';

const config = db.prepare('SELECT modLogChannel, modChannel, messageLogChannel, modRole FROM config WHERE guildId = ?');
const filters = db.prepare('SELECT * FROM filters').all() as {
    action: 'alert' | 'mute' | 'kick' | 'ban'
    duration: string
    regex: string
    shouldDelete: boolean
}[];

const levels = {
    alert: 1,
    mute: 2,
    kick: 3,
    ban: 4,
    1: 'alert',
    2: 'mute',
    3: 'kick',
    4: 'ban'
};

export default {
    name: 'messageCreate',
    async execute (message: Message) {
        const { modLogChannel, modChannel, messageLogChannel, modRole } = config.all(message.guild?.id)[0] as {
            modLogChannel: string
            modChannel: string
            messageLogChannel: string
            modRole: string
        };
        if (message.author.bot || message.channel.isDMBased() || !message.member || message.member.roles.highest.comparePositionTo(modRole) >= 0) {
            return;
        }

        const excludedCategories = [
            '595522513249894400', //russian
            '615452930577006602', //french
            '586484740949934080', //spanish
            '577582576902864896', //german
            '663664101452677120', //japanese
            '823503726470758400', //italian
            '686483899827879979', //portugese
            '610749085955260416' //polish
        ];

        const category = message.channel.isThread() ? message.channel.parent?.parentId : message.channel.parentId;
        if (!category || excludedCategories.includes(category)) {
            return;
        }

        const matches = [];
        const normalizedMsg = remove(message.content);
        for (const filter of filters) {
            if (new RegExp(filter.regex, 'igms').test(normalizedMsg)) {
                matches.push(filter);
            }
        }
        if (!matches.length) {
            return;
        }
        const highest = {
            level: -Infinity,
            duration: '',
            shouldDelete: false
        };
        const regexes = [];
        for (const match of matches) {
            const level = levels[match.action];
            const matchDuration = parseDuration(match.duration, 'ms');
            const highestDuration = parseDuration(highest.duration, 'ms');
            if (highest.level) {
                if (level > highest.level) {
                    highest.level = level;
                    highest.duration = match.duration;
                    highest.shouldDelete = match.shouldDelete;
                } else if (match.shouldDelete > highest.shouldDelete) {
                    highest.level = level;
                    highest.duration = match.duration;
                    highest.shouldDelete = match.shouldDelete;
                } else if (matchDuration && highestDuration && matchDuration > highestDuration) {
                    highest.level = level;
                    highest.duration = match.duration;
                    highest.shouldDelete = match.shouldDelete;
                } else {
                    //do nothing
                }
            } else {
                highest.level = level;
                highest.duration = match.duration;
                highest.shouldDelete = match.shouldDelete;
            }
            regexes.push('`' + new RegExp(match.regex, 'igms').toString() + '`');
        }
        if (highest.level === 2 && !highest.duration) {
            highest.duration = '28d';
        }
        const highestDuration = parseDuration(highest.duration, 'ms');
        const duration28d = parseDuration('28d', 'ms');
        if (highestDuration && duration28d && highestDuration > duration28d) {
            highest.duration = '28d';
            console.warn('Setting duration for filter `' + regexes.join('\n • ') + '` to 28d due to being ' + highest.duration);
        }
        let noUrl;
        let url = `https://discord.com/channels/${message.guildId}/`;
        if (highest.shouldDelete) {
            message.delete();
            const filter = (m: Message) => m.embeds.some(embed => embed.fields.some(field => field.value.includes(message.id)));
            const channel = await message.guild?.channels.fetch(messageLogChannel);
            if (channel?.isTextBased()) {
                const collected = await channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 10_000
                });
                if (collected.size) {
                    url += messageLogChannel + '/' + collected.firstKey();
                } else {
                    noUrl = true;
                }
            }
        } else {
            url += `${message.channelId}/${message.id}`;
        }
        const logEmbed = new EmbedBuilder()
            .setTitle('Automatic ' + levels[highest.level as keyof typeof levels])
            .setDescription(message.content)
            .addFields([{
                name: 'User',
                value: '<@' + message.author.id + '>'
            }, {
                name: 'Channel',
                value: '<#' + message.channel.id + '>'
            }, {
                name: 'Auto Deleted?',
                value: (highest.shouldDelete ? 'Yes' : 'No')
            }]);
        if (highest.level === 2) {
            logEmbed.addFields([{
                name: 'Duration',
                value: highest.duration
            }]);
        }
        logEmbed.addFields([{
            name: 'Matched',
            value: '• ' + regexes.join('\n • ')
        }]);
        if (!noUrl) {
            logEmbed.setURL(url);
        }
        const channel = await message.guild?.channels.fetch(modLogChannel);
        if ( !channel?.isTextBased()) return;

        const msg = await channel.send({
            embeds: [
                logEmbed
            ]
        });
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Reason')
                    .setStyle(ButtonStyle.Link)
                    .setURL(msg.url)
            );
        const generateModAlertWording = function () {
            if (highest.level === 1) {
                return 'triggered an alert';
            }
            if (highest.level === 2) {
                return 'been muted for ' + highest.duration;
            }
            return levels[highest.level as keyof typeof levels] + 'ed';
        };

        const mod = await message.guild?.channels.fetch(modChannel);
        if ( !mod?.isTextBased() ) return;

        await mod.send({
            content: `<@${message.author.id}> has ${generateModAlertWording()}.`,
            components: [
                row
            ]
        });
        const duration = parseDuration(highest.duration, 'ms');
        switch (highest.level) {
        case 1:
            //do nothing
            break;
        case 2:
            if ( duration ) {
                (await message.guild?.members.fetch(message.author.id))?.timeout(duration, 'Automod');
            }
            break;
        case 3:
            await message.member.kick('Automod');
            break;
        case 4:
            await message.member.ban({
                reason: 'Automod'
            });
            break;
        }
    }
};