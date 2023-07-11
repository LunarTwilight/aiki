import { remove } from 'confusables';
import { EmbedBuilder, Message } from 'discord.js';
import { perspectiveAPIkey } from '../config.json';
// @ts-expect-error - no types
import Perspective from 'perspective-api-client';
import _ from 'lodash';
const perspective = new Perspective({
    apiKey: perspectiveAPIkey
});
import db from '../database.js';
const config = db.prepare('SELECT modChannel, modRole FROM config WHERE guildId = ?');

const formatScores = async (scores: number[]) => {
    const list: unknown[] = [];
    _.each(scores, (value: number, key: unknown) => {
        if (value >= 0.9) {
            list.push(key);
        }
    });
    return list.join(', ');
};

const calculateScores = async (result: { summaryScore: { value: number } }[]) => {
    const scores = {};
    _.each(result, (value, key) => {
        _.set(scores, key, value.summaryScore.value.toFixed(2));
    });
    return scores;
};

export default {
    name: 'messageCreate',
    async execute (message: Message) {
        const { modChannel, modRole } = config.all(message.guild?.id)[0] as {
            modChannel: string
            modRole: string
        };
        if (
            message.author.bot ||
            (message.member?.roles.highest.comparePositionTo(modRole) ?? 0) >= 0 ||
            !message.content.trim() ||
            !remove(message.content).trim() ||
            message.channel.isDMBased()
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
        const category = message.channel.isThread() ? message.channel.parent?.parentId : message.channel.parentId;
        if (!category || excludedCategories.includes(category)) {
            return;
        }

        const { attributeScores: result } = await perspective.analyze({
            comment: {
                text: remove(message.content)
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

        if (_.some(Object.values(scores), (item: number) => item >= 0.9)) {
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
                    value: (await formatScores(scores as number[])),
                    inline: true
                }]);
            
            const channel = await message.guild?.channels.fetch(modChannel);
            if (!channel?.isTextBased()) return;

            await channel.send({
                embeds: [
                    embed
                ]
            });
        }
    }
};