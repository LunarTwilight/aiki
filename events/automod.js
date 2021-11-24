const parseDuration = require('parse-duration');
const { MessageEmbed } = require('discord.js');
const { muteRole, modChannel, modLogChannel } = require('../config.json');
const db = require('../database.js');
const filters = db.prepare('SELECT * FROM filters').all();
const addMuteToDB = db.prepare('INSERT INTO mutes (userid, expiry) VALUES (?, ?)');

const levels = {
    alert: 1,
    mute: 2,
    kick: 3,
    ban: 4,
    1: 'alert',
    2: 'mute',
    3: 'kick',
    4: 'ban'
}

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        if (message.author.bot) {
            return;
        }

        const matches = [];
        for (var filter of filters) {
            if (new RegExp(filter.regex, 'igm').test(message.content)) {
                matches.push(filter);
            }
        }
        if (!matches.length) {
            return;
        }
        const highest = {
            level: undefined,
            duration: undefined
        };
        const regexes = [];
        for (var match of matches) {
            const level = levels[match.action];
            if (highest.level) {
                if (level > highest.level) {
                    highest.level = level;
                    highest.duration = match.duration;
                } else {
                    //do nothing
                }
            } else {
                highest.level = level;
                highest.duration = match.duration;
            }
            regexes.push('`' + new RegExp(filter.regex, 'igm').toString() + '`');
        }
        if (highest.level === 2 && !highest.duration) {
            highest.duration = 'infinite';
        }
        const url = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
        const logEmbed = new MessageEmbed()
            .setTitle('Automatic ' + levels[highest.level])
            .setURL(url)
            .setDescription(message.content)
            .addField('User', '<@' + message.author.id + '>');
        if (highest.level === 2) {
            logEmbed.addField('Duration', highest.duration);
        }
        logEmbed.addField('Matched', '• ' + regexes.join('\n • '));
        message.guild.channels.cache.get(modLogChannel).send({
            embeds: [
                logEmbed
            ]
        });
        const action = highest.level === 2 ? 'muted for ' + highest.duration : levels[highest.level] + 'ed';
        if (highest.level !== 1) {
            message.guild.channels.cache.get(modChannel).send(`<@${message.author.id}> has been ${action} because of <${url}>.`);
        }
        switch (highest.level) {
            case 1:
                //do nothing
                break;
            case 2: {
                const user = await message.guild.members.fetch(message.author.id);
                user.roles.add(muteRole);
                if (highest.duration !== 'infinite') {
                    const expiry = Date.now() + parseDuration(highest.duration, 'ms');
                    addMuteToDB.run(message.author.id, expiry);
                }
                break;
            }
            case 3:
                message.member.kick('Automod');
                break;
            case 4:
                message.member.ban({
                    reason: 'Automod'
                });
                break;
        }
    }
}