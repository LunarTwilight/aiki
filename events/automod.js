const parseDuration = require('parse-duration');
const { MessageEmbed } = require('discord.js');
const config = require('../config.js');
const db = require('../database.js');
const filters = db.prepare('SELECT * FROM filters').all();
const addMuteToDB = db.prepare('INSERT INTO mutes (userId, guildId, expiry) VALUES (?, ?, ?)');

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
            regexes.push('`' + new RegExp(match.regex, 'igm').toString() + '`');
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
        const guildConfig = config.find(item => item.guildId === BigInt(message.guild.id));
        message.guild.channels.cache.get(guildConfig.modLogChannel.toString()).send({
            embeds: [
                logEmbed
            ]
        });
        const action = highest.level === 2 ? 'muted for ' + highest.duration : levels[highest.level] + 'ed';
        if (highest.level !== 1) {
            message.guild.channels.cache.get(guildConfig.modChannel.toString()).send(`<@${message.author.id}> has been ${action} because of <${url}>.`);
        }
        switch (highest.level) {
            case 1:
                //do nothing
                break;
            case 2: {
                const user = await message.guild.members.fetch(message.author.id);
                user.roles.add(guildConfig.muteRole.toString());
                if (highest.duration !== 'infinite') {
                    const expiry = Date.now() + parseDuration(highest.duration, 'ms');
                    addMuteToDB.run(message.author.id, message.guild.id, expiry);
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