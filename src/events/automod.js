const parseDuration = require('parse-duration');
const confusables = require('confusables');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modLogChannel, modChannel, messageLogChannel, modRole FROM config WHERE guildId = ?');
const filters = db.prepare('SELECT * FROM filters').all();

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

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { modLogChannel, modChannel, messageLogChannel, modRole } = config.all(message.guild.id)[0];
        if (message.author.bot || message.member.roles.highest.comparePositionTo(modRole) >= 0) {
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
        if (excludedCategories.includes((message.channel.isThread() ? message.channel.parent?.parentId : message.channel.parentId))) {
            return;
        }

        const matches = [];
        const normalizedMsg = confusables.remove(message.content);
        for (var filter of filters) {
            if (new RegExp(filter.regex, 'igms').test(normalizedMsg)) {
                matches.push(filter);
            }
        }
        if (!matches.length) {
            return;
        }
        const highest = {
            level: null,
            duration: null,
            shouldDelete: null
        };
        const regexes = [];
        for (var match of matches) {
            const level = levels[match.action];
            if (highest.level) {
                if (level > highest.level) {
                    highest.level = level;
                    highest.duration = match.duration;
                    highest.shouldDelete = match.shouldDelete;
                } else if (match.shouldDelete > highest.shouldDelete) {
                    highest.level = level;
                    highest.duration = match.duration;
                    highest.shouldDelete = match.shouldDelete;
                } else if (parseDuration(match.duration, 'ms') > parseDuration(highest.duration, 'ms')) {
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
        if (parseDuration(highest.duration, 'ms') > parseDuration('28d', 'ms')) {
            highest.duration = '28d';
            console.warn('Setting duration for filter `' + regexes.join('\n • ') + '` to 28d due to being ' + highest.duration);
        }
        let noUrl;
        let url = `https://discord.com/channels/${message.guildId}/`;
        if (highest.shouldDelete) {
            message.delete();
            const filter = m => m.embeds.some(embed => embed.fields.some(field => field.value.includes(message.id)));
            const collected = await message.guild.channels.cache.get(messageLogChannel).awaitMessages({
                filter,
                max: 1,
                time: 10_000,
                error: ['time']
            });
            if (collected.size) {
                url += messageLogChannel + '/' + collected.firstKey();
            } else {
                noUrl = true;
            }
        } else {
            url += `${message.channelId}/${message.id}`;
        }
        const logEmbed = new EmbedBuilder()
            .setTitle('Automatic ' + levels[highest.level])
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
        const msg = await message.guild.channels.cache.get(modLogChannel).send({
            embeds: [
                logEmbed
            ]
        });
        const row = new ActionRowBuilder()
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
            return levels[highest.level] + 'ed';
        };
        await message.guild.channels.cache.get(modChannel).send({
            content: `<@${message.author.id}> has ${generateModAlertWording()}.`,
            components: [
                row
            ]
        });
        switch (highest.level) {
            case 1:
                //do nothing
                break;
            case 2:
                (await message.guild.members.fetch(message.author.id)).timeout(parseDuration(highest.duration, 'ms'), 'Automod');
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