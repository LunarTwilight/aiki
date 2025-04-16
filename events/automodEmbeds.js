const db = require('../database.js');
const config = db.prepare('SELECT modLogChannel, modChannel, messageLogChannel, modRole FROM config WHERE guildId = ?');

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { modRole } = config.all(message.guild.id)[0];
        if (message.author.bot || message.member.roles.highest.comparePositionTo(modRole) >= 0) {
            return;
        }

        const watchedCategories = [
            '563020189604773890', // general
            '575022973568811019', // technical
        ];

        const category = message.channel.isThread() ? message.channel.parent?.parentId : message.channel.parentId;
        if (!watchedCategories.includes(category)) {
            return;
        }

        const fandomEmbeds = message.embeds.some(embed => {
            if (embed.data.type !== 'link') {
                return false;
            }

            const host = new URL(embed.data.url).host
            return host.endsWith('.fandom.com') && host !== 'community.fandom.com'
        })
        if (fandomEmbeds) {
            await message.suppressEmbeds();
        }
    }
};
