const db = require('../database.js');
const config = db.prepare('SELECT verifiedRole, englishRole FROM config WHERE guildId = ?');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (!interaction.isMessageContextMenuCommand()) {
            return;
        }

        const { verifiedRole, englishRole } = config.get(interaction.guildId);
        const target = await interaction.guild.members.fetch(interaction.targetMessage.author.id);
        if (target.roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: 'User is already verified.',
                ephemeral: true
            });
            return;
        }
        if (!/^verify-/.test(interaction.channel.name)) {
            await interaction.reply({
                content: 'This can only be used in a verification thread.',
                ephemeral: true
            });
            return;
        }

        const username = interaction.targetMessage.content.match(/((!)?verify )?(.*)/)[3];
        const reason = `Manual verification done by ${(interaction.member.nickname || interaction.member.user.username)}`;
        await target.setNickname(username, reason);
        await target.roles.add([verifiedRole, englishRole], reason);
        await interaction.reply({
            content: 'User has been verified.',
            ephemeral: true
        });
    }
};