const { parseDuration } = require('parse-duration');
const { MessageEmbed } = require('discord.js');
const { muteRole, modChanel, modLogChannel } = require('../config.json');

const levels = {
    alert: '1',
    mute: '2',
    kick: '3',
    ban: '4',
    1: 'alert',
    2: 'mute',
    3: 'kick',
    4: 'ban'
}

module.exports = {
    name: 'messageCreate',
    async execute (message, db) {
        if (message.author.bot) {
            return;
        }

        const matches = [];
        const filters = db.prepare('SELECT * FROM filters').all();
        const addMuteToDB = db.prepare('INSERT INTO mutes (userid, expiry) VALUES (?, ?)');
        for (var filter in filters) {
            const regexp = new RegExp(filter.regex, 'igm');
            if (regexp.test(message.content)) {
                matches.push(filter);
            }
        }
        if (!matches.length) {
            return;
        }
        const highest = {
            level: '',
            duration: ''
        };
        const regexes = [];
        for (var match in matches) {
            const level = levels[match.action];
            if (!highest) {
                highest.level = level;
                highest.duration = match.duration;
            } else {
                if (level > highest) {
                    highest.level = level;
                    highest.duration = match.duration;
                } else {
                    //do nothing
                }
            }
            regexes.push(match.regex);
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
        message.client.channels.cache.get(modLogChannel).send({
            embeds: [
                logEmbed
            ]
        });
        const action = highest.level === 2 ? levels[highest.level] + 'for ' + highest.duration : levels[highest.level];
        message.client.channels.cache.get(modChanel).send(`<@${message.author.id}> has been ${action} because of <${url}>.`);
        switch (highest.level) {
            case 1:
                //do nothing
                break;
            case 2: {
                const user = await message.guide.members.fetch(message.author.id);
                user.roles.add(muteRole);
                const expiry = Date.now() + parseDuration(highest.duration, 'ms');
                addMuteToDB.run(message.author.id, expiry);
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