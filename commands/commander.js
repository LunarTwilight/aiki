const { SlashCommandBuilder } = require('discord.js');
const { devId, mainServer, testServer } = require('../config.json');
const { inspect } = require('util');
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
                .setName('reports')
                .setDescription('Set up reports channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('restart')
                .setDescription('Restarts the bot')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('deploycommands')
                .setDescription('Deploys slash commands')
                .addStringOption(option =>
                    option
                        .setName('location')
                        .setDescription('Location of slash commands deployment')
                        .setRequired(true)
                        .addChoices({
                            name: 'global',
                            value: 'global'
                        }, {
                            name: 'F/G',
                            value: mainServer
                        }, {
                            name: 'Test',
                            value: testServer
                        })
                )
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions('0'),
    async execute (interaction) {
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
                    text = inspect(await eval(interaction.options.getString('input'))); //eslint-disable-line no-eval
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
            case 'reports':
                require('../setupReports.js').execute(interaction);
                break;
            case 'restart':
                await interaction.editReply('it shall be done');
                process.exit(); //should automatically restart
                break; //this is technically unreachable and VSC complains about it, but eslint complains about not having it sooo
            case 'deploycommands':
                require('../deployCommands.js').execute(interaction);
                break;
        }
    }
};