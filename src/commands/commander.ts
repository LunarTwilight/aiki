import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { devId, mainServer, testServer } from '../config.json';
import { inspect } from 'util';
inspect.defaultOptions = {
    compact: false,
    breakLength: Infinity
};

export default {
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
        .setDMPermission(false),
    async execute (interaction: ChatInputCommandInteraction) {
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
        let script: { execute: Function };
        switch (interaction.options.getSubcommand()) {
        case 'eval': {
            let text = null;
            try {
                text = inspect(await eval(interaction.options.getString('input') ?? '')); //eslint-disable-line no-eval
            } catch (error) {
                text = `${ error }`;
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
            script = await import('../setupRoles.js') as typeof script;
            script.execute(interaction);
            break;
        case 'rules':
            script = await import('../setupRules.js') as unknown as typeof script;
            script.execute(interaction);
            break;
        case 'restart':
            await interaction.editReply('it shall be done');
            //eslint-disable-next-line no-process-exit
            process.exit(); //should automatically restart
            break; //this is technically unreachable and VSC complains about it, but eslint complains about not having it sooo
        case 'deploycommands':
            script = await import('../deployCommands.js') as typeof script;
            script.execute(interaction);
            break;
        }
    }
};