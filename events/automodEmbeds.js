const getConfig = require('../config.js');

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { modRole } = getConfig(message.guild.id);
        if (message.author.bot || message.member.roles.highest.comparePositionTo(modRole) >= 0) {
            return;
        }

        const watchedCategories = [
            '563020189604773890', // general
            '575022973568811019' // technical
        ];

        const category = message.channel.isThread() ? message.channel.parent?.parentId : message.channel.parentId;
        if (!watchedCategories.includes(category)) {
            return;
        }

        const fandomEmbeds = message.embeds.some(embed => {
            if (embed.data.type !== 'link' && embed.data.type !== 'article') {
                return false;
            }

            const { host } = new URL(embed.data.url);
            return host.endsWith('.fandom.com') && host !== 'community.fandom.com';
        });
        if (fandomEmbeds) {
            await message.suppressEmbeds();
        }
    }
};
