const { generateMatches, calculateHighestMatch, generateModLogEmbed, sendModChannelAlert, doPunishment } = require('../automodCore.js');
const getConfig = require('../config.js');

module.exports = {
    name: 'threadCreate',
    async execute (thread, newlyCreated) {
        if (!newlyCreated) {
            return;
        }
        const { modLogChannel, modChannel } = getConfig(thread.guild.id);
        const owner = await thread.guild.members.fetch(thread.ownerId);
        if (owner.user.bot || owner.isMod) {
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
        if (excludedCategories.includes(thread.parent?.parent?.parentId)) {
            return;
        }

        const matches = generateMatches(thread.name);
        if (!matches) {
            return;
        }

        const { regexes, highest } = calculateHighestMatch(matches);

        const msg = await generateModLogEmbed({
            highest,
            content: thread.name,
            authorId: owner.id,
            channelId: thread.id,
            isThread: true,
            regexes,
            url: thread.url,
            modLogChannel: thread.guild.channels.cache.get(modLogChannel)
        });
        await sendModChannelAlert(msg, owner.id, thread.guild.channels.cache.get(modChannel), highest);
        await doPunishment(highest, owner);
    }
};