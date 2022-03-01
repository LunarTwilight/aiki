const { SlashCommandBuilder } = require('@discordjs/builders');
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
                .setName('roles')
                .setDescription('Set up roles channel')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('restart')
                .setDescription('Restarts the bot')
        ),
    async execute (interaction) {
        if (!interaction.inGuild()) {
            return await interaction.reply({
                content: 'This command is only avalible in a server.',
                ephemeral: true
            });
        }
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
            case 'eval':
                interaction.editReply('something happened ig');
                eval(interaction.options.getString('input'));
                break;
            case 'roles':
                require('../setupRoles.js').execute(interaction);
                break;
            case 'restart':
                process.exit(); //will automatically restart
                break;
        }
    }
}