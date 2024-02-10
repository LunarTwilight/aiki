const { bold, hyperlink } = require('discord.js');
const QUOTE_PATTERN = /(?<!<)https?:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/channels\/(@me|\d+)\/(\d+)\/(\d+)(?!>)/g;
const MAX = 3;

const matchQuotes = text => {
    const matches = [];
    const regex = QUOTE_PATTERN;
    let m;

    regex.lastIndex = 0;

    while ((m = regex.exec(text)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        matches.push(m);
    }

    return matches;
};

const tryFetchQuote = async (message, match) => {
    const [_, guildId, channelId, messageId] = match;
    if (guildId === '@me') {
        return null;
    }

    try {
        const channel = await message.client.channels.fetch(channelId);
        if (!channel) {
            return null;
        }

        const messages = await channel.messages.fetch({ limit: 1, around: messageId });
        if (!messages.size) {
            return null;
        }

        const msg = messages.first();
        if (msg.id !== messageId) {
            return null;
        }

        return msg;
    } catch {
        return null;
    }
};

const stringifyEmbed = ({
    provider,
    author,
    title,
    url,
    description,
    fields,
    footer,
    timestamp
}) => {
    const sections = Array.from({ length: 4 }).fill(null).map(() => []);

    if (provider) {
        sections[0].push(provider.name);
    }

    if (author && author.name) {
        const name = author.url ?
            `[${author.name}](${author.url})` :
            `${author.name}`;

        sections[0].push(`${name}`);
    }

    if (title) {
        const str = url ?
            `[${title}](${url})` :
            `${title}`;

        sections[0].push(str);
    }

    if (description) {
        sections[0].push(`${description}`);
    }

    if (fields.length) {
        for (const field of fields) {
            sections[1].push(`${field.name}:`, field.value.split('\n').map(line => `  ${line}`).join('\n'));
        }
    }

    if (footer) {
        if (timestamp) {
            sections[3].push(`${footer.text} • <t:${Math.floor(new Date(timestamp).getTime() / 1000)}:f>`);
        } else {
            sections[3].push(`${footer.text}`);
        }
    }

    return sections
        .filter(section => section.length)
        .map(section => section.join('\n'))
        .join('\n\n');
};

const buildQuoteEmbed = (message, quote, includeQuoter) => {
    const sameChannel = message.channel.id === quote.channel.id;
    const sameGuild = message.guild.id === quote.guild.id;
    let text = quote.member?.nickname || quote.author.username;

    if (!sameChannel) {
        text += sameGuild ? ` @ #${quote.channel.name}` : ` @ ${quote.guild.name}#${quote.channel.name}`;
    }

    let description = bold(hyperlink('Click to jump', `https://discord.com/channels/${quote.guild.id}/${quote.channel.id}/${quote.id}`));

    if (quote.content) {
        description += '\n\n' + quote.content;
    } else if (quote.embeds.length) {
        description += '\n\n' + stringifyEmbed(quote.embeds[0]);
    }

    if (description.length > 2048) {
        return null;
    }

    const image = quote.attachments.size ?
        quote.attachments.first() :
        quote.embeds[0] && quote.embeds[0].image;

    const author = includeQuoter ?
        {
            icon_url: message.author.displayAvatarURL(),
            name: `Quoted by ${message.author.username}#${message.author.discriminator}`
        } :
        undefined;

    return {
        author,
        // title: 'Click to jump',
        // url: `https://discord.com/channels/${quote.guild.id}/${quote.channel.id}/${quote.id}`,
        description,
        image: image || undefined,
        footer: {
            icon_url: quote.author.displayAvatarURL(),
            text
        },
        timestamp: quote.createdAt.toISOString()
    };
};

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        //Ignore bots
        if (message.author.bot) {
            return;
        }

        const quotes = matchQuotes(message.content);
        if (!quotes.length) {
            return;
        }

        const messages = await Promise.all(
            quotes
                .slice(0, MAX)
                .map(tryFetchQuote.bind(this, message))
        );
        const filtered = messages.filter(quote => quote !== null);
        if (filtered.length === 0) {
            return;
        }

        const shouldDelete = message.reference === null &&
            quotes.length <= MAX &&
            message.content.replaceAll(QUOTE_PATTERN, '').trim() === '';

        const embeds = filtered
            .map((quote, i) => buildQuoteEmbed(message, quote, i === 0))
            .filter(Boolean);

        try {
            await message.channel.send({
                embeds
            });
        } catch {
            return;
        }

        if (shouldDelete) {
            try {
                await message.delete();
            } catch {
                //do nothing
            }
        }
    }
};