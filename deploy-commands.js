const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')),
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