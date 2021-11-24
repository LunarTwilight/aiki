const { MessageEmbed, Permissions } = require('discord.js');
const imageOptions = {
    dynamic: true,
    format: 'png',
    size: 64
}

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        if (!message.channel.isText() || message.system || message.webhookId || message.author.bot || message.author.id === message.client.user.id) {
            return;
        }

        if (!message.channel.permissionsFor(message.client.user.id)?.has((message.channel.isThread() ? Permissions.FLAGS.SEND_MESSAGES_IN_THREADS : Permissions.FLAGS.SEND_MESSAGES))) return;

        const quotedMessages = new Set();
        const quoteRegex = /<?\bhttps:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)\b>?/g;
        let quoteMatch = null;
        while (quoteMatch = quoteRegex.exec(message.content)) {
            if (quoteMatch[0].startsWith('<') && quoteMatch[0].endsWith('>')) continue;
            if (quotedMessages.has(quoteMatch[1] + '/' + quoteMatch[2] + '/' + quoteMatch[3])) continue;
            quotedMessages.add(quoteMatch[1] + '/' + quoteMatch[2] + '/' + quoteMatch[3]);
            console.log(message.guild.name + ': ' + quoteMatch[1] + '/' + quoteMatch[2] + '/' + quoteMatch[3]);
            let deleteMessage = false;
            if (quoteMatch[0].length === message.content.length && !(message.attachments.size || message.embeds.length)) {
                deleteMessage = message.deletable;
            }
            let quoteChannel = null;
            if (message.guildId === quoteMatch[1]) {
                quoteChannel = message.guild.channels.cache.get(quoteMatch[2]);
            } else {
                const quoteGuild = message.client.guilds.cache.get(quoteMatch[1]);
                if (!await quoteGuild?.members.fetch(message.author.id).catch(error => console.log('- ' + error))) continue;
                quoteChannel = await quoteGuild.channels.fetch(quoteMatch[2]).catch(error => console.log('- ' + error));
            }
            if (!quoteChannel?.permissionsFor(message.author.id)?.has(Permissions.FLAGS.VIEW_CHANNEL)) continue;
            if (!quoteChannel.permissionsFor(message.client.user.id)?.has(Permissions.FLAGS.VIEW_CHANNEL)) continue;
            await quoteChannel.messages?.fetch(quoteMatch[3]).then(async quote => {
                await quote.guild?.members.fetch(quote.author.id).catch(error => console.log('- ' + error));
                let quoteAuthor = quote.author.tag + (quote.member?.roles.highest.unicodeEmoji ? ' ' + quote.member.roles.highest.unicodeEmoji : '') + (message.guildId !== quoteMatch[1] ? ' • ' + quoteChannel.guild.name : '') + (message.channelId !== quoteMatch[2] ? ' • #' + quoteChannel.name : '');
                if (quote.member?.nickname && quoteAuthor.length + quote.member.nickname.length < 250 && !(quote.member.nickname.toLowerCase().includes(quote.author.username.toLowerCase()) || quote.author.username.toLowerCase().includes(quote.member.nickname.toLowerCase()))) quoteAuthor = quote.member.nickname + ' • ' + quoteAuthor;
                let quotedBy = 'Quoted by ' + message.author.tag;
                if (message.member?.nickname && !(message.member.nickname.toLowerCase().includes(message.author.username.toLowerCase()) || message.author.username.toLowerCase().includes(message.member.nickname.toLowerCase()))) quotedBy += ' (' + message.member.nickname + ')';
                let embeds = [];
                const embed = new MessageEmbed().setAuthor(quoteAuthor, (quote.member || quote.author).displayAvatarURL(imageOptions)).setDescription(quote.content).setFooter(quotedBy, message.member.displayAvatarURL(imageOptions)).setTimestamp(quote.createdAt).setColor(quote.member?.displayColor || null);
                embeds.push(embed);
                if (quote.attachments.size) embed.setImage(quote.attachments.first().url);
                else if (!quote.content && quote.embeds.length) {
                    embeds = [];
                    const embed1 = new MessageEmbed().setAuthor(quoteAuthor, (quote.member || quote.author).displayAvatarURL(imageOptions)).setColor(quote.member?.displayColor || null);
                    const embed2 = new MessageEmbed().setFooter(quotedBy, message.member.displayAvatarURL(imageOptions)).setTimestamp(quote.createdAt).setColor(message.member?.displayColor || null);
                    embeds.push(embed1);
                    let i = 0;
                    while (i < 8 && quote.embeds[i] && (embeds.reduce((acc, val) => acc + val.length, 0) + embed2.length + quote.embeds[i].length) <= 5500) {
                        embeds.push(quote.embeds[i]);
                        i++;
                    }
                    embeds.push(embed2);
                } else if (/^https:\/\/[a-z\d.-]+\.[a-z\d-]+(?:\/[\w/.?=&#-]*)?$/.test(quote.content)) embed.setImage(quote.content);
                message.channel.send({
                    content: (deleteMessage ? `<${quote.url}>` : null),
                    embeds,
                    reply: {
                        messageReference: ((deleteMessage && message.reference?.messageId) || (message.channelId === quote.channelId ? quote.id : null)),
                        failIfNotExists: false
                    },
                    allowedMentions: {
                        parse: [],
                        repliedUser: false
                    }
                }).then(() => {
                    if (deleteMessage) message.delete().catch(error => console.log('- ' + error));
                }, error => console.log('- ' + error))
            }, error => console.log('- ' + error));
            if (deleteMessage) return;
        }
    }
};