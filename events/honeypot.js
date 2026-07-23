const getConfig = require('../config.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { honeypotChannel, modChannel, modLogChannel, messageLogChannel } = getConfig(message.guild.id);
        if (message.author.bot || !message.member.bannable || message.channel.id !== honeypotChannel) {
            return;
        }

        const filter = m => m.embeds.some(embed => embed.fields.some(field => field.value.includes(message.id)));
        const collected = await message.guild.channels.cache.get(messageLogChannel).awaitMessages({
            filter,
            max: 1,
            time: 10_000,
            error: ['time']
        });
        message.delete();
        const url = collected.size ? `https://discord.com/channels/${message.guildId}/${messageLogChannel}/${collected.firstKey()}` : null;

        const embed = new EmbedBuilder()
            .setTitle('Honeypot hit')
            .setDescription(message.content)
            .addFields([{
                name: 'User',
                value: '<@' + message.author.id + '>'
            }, {
                name: 'Location',
                value: (url ?? `<#${message.channel.id}>`)
            }]);

        const msg = await modLogChannel.send({
            embeds: [
                embed
            ]
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Reason')
                    .setStyle(ButtonStyle.Link)
                    .setURL(msg.url)
            );
        await modChannel.send({
            content: `<@${message.author.id}> has triggered the honeypot.`,
            components: [
                row
            ]
        });

        await message.member.ban({
            reason: 'Triggered honeypot'
        });
    }
};
