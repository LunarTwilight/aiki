import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import needle from 'needle';
import db from '../database.js';
const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');

export default {
    data: new SlashCommandBuilder()
        .setName('parse')
        .setDescription('Parses wikitext')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The wikitext to parse')
                .setRequired(true)
        )
        .setDMPermission(false),
    async execute (interaction: ChatInputCommandInteraction) {
        const { verifiedRole } = config.get(interaction.guildId) as {
            verifiedRole: string
        };
        const roles = interaction.member?.roles;
        if (!roles || Array.isArray(roles)) return;
        if (!roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: 'This command can not be used by non-verified users.',
                ephemeral: true
            });
            return;
        }

        needle.request('get', 'https://community.fandom.com/api.php', {
            action: 'parse',
            text: interaction.options.getString('text'),
            contentmodel: 'wikitext',
            format: 'json',
            formatversion: 2,
            disabletoc: true,
            disablelimitreport: true,
            wrapoutputclass: null,
            prop: 'text'
        }, {
            user_agent: 'Aiki (contact Sophiedp about issues)'
        }, async (err, req) => {
            if (err || req.body.error) {
                console.error((err || req.body.error));
                await interaction.reply({
                    content: 'Something went wrong while requesting data from the API!',
                    ephemeral: true
                });
                return;
            }

            if (req.body.parse.text.length > 1985) {
                await interaction.reply('Sorry, result is too long.');
                return;
            }

            if (!req.body.parse.text.length) {
                await interaction.reply('```\n""\n```');
                return;
            }

            await interaction.reply('```html\n' + req.body.parse.text + '\n```');
        });
    }
};