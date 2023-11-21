const { generateMatches, generateModLogEmbed, sendModChannelAlert, doPunishment } = require('../automodCore.js');
const db = require('../database.js');
const config = db.prepare('SELECT modLogChannel, modChannel, messageLogChannel, modRole FROM config WHERE guildId = ?');

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

        const { regexes, highest } = generateMatches(message.content);

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
                url = null;
            }
        } else {
            url += `${message.channelId}/${message.id}`;
        }
        const msg = await generateModLogEmbed(highest, message, regexes, url, modLogChannel);
        await sendModChannelAlert(msg, message, modChannel, highest);
        await doPunishment(highest, message);
    }
};