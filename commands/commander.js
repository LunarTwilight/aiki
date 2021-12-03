const { SlashCommandBuilder } = require('@discordjs/builders');
const shell = require('shelljs');
const { devId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commander')
        .setDescription('Controls the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Updates the bot')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('revert')
                .setDescription('Reverts last update')
        )
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
                .setName('exec')
                .setDescription('Executes a command')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('The command to run')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('Set up roles channel')
        ),
    async execute (interaction) {
        if (interaction.user.id !== devId) {
            return interaction.reply({
                content: 'https://tenor.com/view/anko-stick-tongue-out-tamako-market-taunt-gif-12801230',
                ephemeral: true
            });
        }
        const cmd = interaction.options.getSubcommand();
        if (cmd === 'roles') {
            await interaction.deferReply({
                ephemeral: true
            });
            return require('../setupRoles.js').execute(interaction);
        }
        if (cmd === 'eval') {
            interaction.reply('something happened ig');
            eval(interaction.options.getString('input'));
            return;
        }
        await interaction.deferReply();
        let command;
        switch (cmd) {
            case 'update':
                command = 'cd ~/aiki && git pull';
                break;
            case 'revert':
                command = 'git reset --hard ORIG_HEAD';
                break;
            case 'exec':
                command = interaction.options.getString('command');
                break;
        }
        shell.exec(command, function (code, stdout, stderr) {
            interaction.editReply('Exit code: ', code);
            interaction.followUp('Program output: ', stdout);
            interaction.followUp('Program stderr: ', stderr);
        });
    }
}