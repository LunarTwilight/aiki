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
                .setName('exec')
                .setDescription('Executes a command')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('The command to run')
                        .setRequired(true)
                )
        ),
    async execute (interaction) {
        if (interaction.user.id !== devId) {
            return interaction.reply('https://i.gifer.com/BpGi.gif');
        }
        await interaction.deferReply();
        let command;
        switch (interaction.options.getSubcommand()) {
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
            interaction.reply('Exit code: ', code);
            interaction.followUp('Program output: ', stdout);
            interaction.followUp('Program stderr: ', stderr);
        });
    }
}