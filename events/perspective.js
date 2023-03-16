const confusables = require('confusables');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { perspectiveAPIkey } = require('../config.json');
const Perspective = require('perspective-api-client');
const _ = require('lodash');
const perspective = new Perspective({
    apiKey: perspectiveAPIkey
});
const db = require('../database.js');
const config = db.prepare('SELECT modChannel, modRole FROM config WHERE guildId = ?');

const formatScores = async scores => {
    //
};

const checkThreshold = async scores => {
    const values = Object.values(scores);
    if (_.some(values, item => item >= 0.7)) {
        return true;
    }
    return false;
};

const calculateScores = async result => {
    const scores = {};
    _.each(result, (value, key) => {
        _.set(scores, key, value.summaryScore.value.toFixed(2));
    });
    return scores;
};

module.exports = {
    name: 'messageCreate',
    async execute (message) {
        const { modChannel, modRole } = config.all(message.guild.id)[0];
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

        const { attributeScores: result } = await perspective.analyze({
            comment: {
                text: confusables.remove(message.content)
            },
            requestedAttributes: {
                TOXICITY: {},
                SEVERE_TOXICITY: {},
                IDENTITY_ATTACK: {},
                INSULT: {},
                THREAT: {},
                SEXUALLY_EXPLICIT: {}
            },
            languages: ['en']
        });
        const scores = await calculateScores(result);

        const aboveThreshold = await checkThreshold(scores);

        if (aboveThreshold) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Message')
                        .setStyle(ButtonStyle.Link)
                        .setURL(message.url)
                );
            await message.guild.channels.cache.get(modChannel).send({
                content: `<@${message.author.id}> has sent a message in \`#${message.channel.name}\` that might need mod attention.\n\`\`\`js\n${formatScores(scores)}\n\`\`\``,
                components: [
                    row
                ]
            });
        }
    }
};