const { SlashCommandBuilder } = require('@discordjs/builders');
const { devId } = require('../config.json');
const inspect = require('util');
inspect.defaultOptions = {
    compact: false,
    breakLength: Infinity
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commander')
        .setDescription('Controls the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('eval')
                .setDescription('Eval')
                .addStringOption(option =>
                    option
                        .setName('input')
                        .setDescription('The JS to run')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('Set up roles channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rules')
                .setDescription('Set up rules channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('restart')
                .setDescription('Restarts the bot')
        ),
    async execute (interaction) {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
            return;
        }
        if (interaction.user.id !== devId) {
            await interaction.reply({
                content: 'https://tenor.com/view/anko-stick-tongue-out-tamako-market-taunt-gif-12801230',
                ephemeral: true
            });
            return;
        }
        await interaction.deferReply({
            ephemeral: true
        });
        switch (interaction.options.getSubcommand()) {
            case 'eval': {
                let text = null;
                try {
                    text = inspect(await eval(interaction.response.getString('input'))); //eslint-disable-line no-eval
                } catch (error) {
                    text = error.toString();
                }
                if (!text) {
                    await interaction.editReply('something went wrong, text wasn\'t set');
                    break;
                }
                if (text.length > 1990) {
                    await interaction.editReply('message too long, check console');
                    console.log(text);
                    break;
                }
                await interaction.editReply('```js\n' + text + '\n```');
                break;
            }
            case 'roles':
                require('../setupRoles.js').execute(interaction);
                break;
            case 'rules':
                require('../setupRules.js').execute(interaction);
                break;
            case 'restart':
                await interaction.editReply('it shall be done');
                //eslint-disable-next-line no-process-exit
                process.exit(); //should automatically restart
        }
    }
};