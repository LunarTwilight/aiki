const { SlashCommandBuilder } = require('@discordjs/builders');
const shell = require('shelljs');
const { devId } = require('../config.json');

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
        await interaction.deferReply({
            ephemeral: true
        });
        switch (interaction.options.getSubcommand()) {
            case 'exec':
                shell.exec(interaction.options.getString('command'), (code, stdout, stderr) => {
                    interaction.editReply('Exit code: ', code);
                    interaction.followUp('Program output: ', stdout);
                    interaction.followUp('Program stderr: ', stderr);
                });
                break;
            case 'eval':
                interaction.editReply('something happened ig');
                console.log(interaction.options.getString('input'));
                break;
            case 'roles':
                require('../setupRoles.js').execute(interaction);
                break;
        }
    }
}