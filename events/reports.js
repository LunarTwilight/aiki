const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const config = db.prepare('SELECT modChannel FROM config WHERE guildId = ?');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (interaction.isButton() && interaction.customId === 'create-private-report-thread') {
            const { modChannel } = config.all(interaction.guild.id)[0];
            const modal = new ModalBuilder()
                .setCustomId(`create-private-report-thread`)
                .setTitle(`Please enter the title of your report`);

            const titleField = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Report title')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(titleField);
            modal.addComponents(row);

            await interaction.showModal(modal);

            try {
                const modalInteraction = await interaction.awaitModalSubmit({
                    time: 180000, //3 min
                    filter: i => i.user.id === interaction.user.id
                });
                console.log('modal submit event', modalInteraction);
                const thread = await interaction.channel.threads.create({
                    type: ChannelType.PrivateThread,
                    name: modalInteraction.fields.getTextInputValue('title').trim(),
                    reason: `Private report thread created upon request of ${(interaction.member.nickname || interaction.user.displayName)}`
                });
                console.log('thread', thread);
                await thread.members.add(interaction.user.id);
                await thread.send(`Hey <@${interaction.user.id}>! Please reply in this thread and provide more information about your report, the moderators will look into it as soon as possible!`);
                await modalInteraction.reply({
                    content: `Your report has been created at <#${thread.id}>. Please fill out the report by sending messages in the thread.`,
                    ephemeral: true
                });
                const alertEmbed = new EmbedBuilder()
                    .setTitle('New private report created!')
                    .setURL(thread.url)
                    .setAuthor({
                        name: (interaction.member.nickname || interaction.user.displayName),
                        iconURL: (interaction.member.displayAvatarURL())
                    })
                    .setDescription(modalInteraction.fields.getTextInputValue('title').trim())
                    .setTimestamp();
                console.log('alert embed', alertEmbed);
                await interaction.guild.channels.fetch(modChannel).then(async channel => {
                    channel.send({
                        embeds: [alertEmbed]
                    });
                });
            } catch (error) {
                console.error('report error', error);
                await interaction.followUp({
                    content: 'The modal was not submitted in time, or another error occured.',
                    ephemeral: true
                });
            }
        }
    }
};