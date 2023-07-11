const confusables = require('confusables');
const { EmbedBuilder } = require('discord.js');
const { perspectiveAPIkey } = require('../config.json');
const Perspective = require('perspective-api-client');
const _ = require('lodash');
const perspective = new Perspective({
    apiKey: perspectiveAPIkey
});
const db = require('../database.js');
const config = db.prepare('SELECT modChannel, modRole FROM config WHERE guildId = ?');

const formatScores = async scores => {
    const list = [];
    _.each(scores, (value, key) => {
        if (value >= 0.9) {
            list.push(key);
        }
    });
    return list.join(', ');
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
        if (
            message.author.bot ||
            message.member.roles.highest.comparePositionTo(modRole) >= 0 ||
            !message.content.trim() ||
            !confusables.remove(message.content).trim()
        ) {
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
            languages: ['en'],
            doNotStore: true
        }, {
            doNotStore: true,
            stripHTML: false
        });
        const scores = await calculateScores(result);

        if (_.some(Object.values(scores), item => item >= 0.9)) {
            const embed = new EmbedBuilder()
                .setTitle('Possible mod action needed')
                .setURL(message.url)
                .setDescription('>>> ' + message.content)
                .addFields([{
                    name: 'User',
                    value: '<@' + message.author.id + '>',
                    inline: true
                }, {
                    name: 'Channel',
                    value: '<#' + message.channel.id + '>',
                    inline: true
                }, {
                    name: 'Attributes hit',
                    value: (await formatScores(scores)),
                    inline: true
                }]);
            await message.guild.channels.cache.get(modChannel).send({
                embeds: [
                    embed
                ]
            });
        }
    }
};