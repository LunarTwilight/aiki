const confusables = require('confusables');
const parseDuration = require('parse-duration');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('./database.js');
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

const generateMatches = content => {
    const matches = [];
    const normalizedContent = confusables.remove(content);
    for (var filter of filters) {
        if (new RegExp(filter.regex, 'igms').test(normalizedContent)) {
            matches.push(filter);
        }
    }
    if (!matches.length) {
        return null;
    }
    return matches;
};

const calculateHighestMatch = matches => {
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
    return { regexes, highest };
};

const generateModLogEmbed = async params => {
    const { highest, content, authorId, channelId, isThread, regexes, url, modLogChannel } = params;
    const logEmbed = new EmbedBuilder()
        .setTitle('Automatic ' + levels[highest.level])
        .setDescription(content)
        .addFields([{
            name: 'User',
            value: '<@' + authorId + '>'
        }, {
            name: 'Location',
            value: '<#' + channelId + '>'
        }]);
    if (!isThread) {
        logEmbed.addFields([{
            name: 'Auto Deleted?',
            value: (highest.shouldDelete ? 'Yes' : 'No')
        }]);
    }
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
    if (!url) {
        logEmbed.setURL(url);
    }
    const msg = await modLogChannel.send({
        embeds: [
            logEmbed
        ]
    });
    return msg;
};

const sendModChannelAlert = async (msg, userId, modChannel, highest) => {
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
    await modChannel.send({
        content: `<@${userId}> has ${generateModAlertWording()}.`,
        components: [
            row
        ]
    });
};

const doPunishment = async (highest, member) => {
    switch (highest.level) {
        case 1:
            //do nothing
            break;
        case 2:
            await member.timeout(parseDuration(highest.duration, 'ms'), 'Automod');
            break;
        case 3:
            await member.kick('Automod');
            break;
        case 4:
            await member.ban({
                reason: 'Automod'
            });
            break;
    }
};

module.exports = { generateMatches, calculateHighestMatch, generateModLogEmbed, sendModChannelAlert, doPunishment };