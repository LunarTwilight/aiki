const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Eval')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to eval')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('die')
        .setDescription('die'),
    new SlashCommandBuilder()
        .setName('meme')
        .setDescription('meme'),
    new SlashCommandBuilder()
        .setName('staff')
        .setDescription('posts a link to zendesk'),
    new SlashCommandBuilder()
        .setName('random')
        .setDescription('tells users to go to random'),
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);