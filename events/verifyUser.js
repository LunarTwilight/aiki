const getConfig = require('../config.js');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (!interaction.isMessageContextMenuCommand()) {
            return;
        }

        const { verifiedRole, englishRole } = getConfig(interaction.guildId);
        const target = await interaction.guild.members.fetch(interaction.targetMessage.author.id);
        if (target.roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: 'User is already verified.',
                ephemeral: true
            });
            return;
        }
        if (!interaction.channel.name.startsWith('verify-')) {
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