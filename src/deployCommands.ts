import fs from 'fs'
import { ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder } from 'discord.js'
import { clientId, token } from './config.json'

export async function execute( interaction: ChatInputCommandInteraction ) {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = await import(`./commands/${file}`) as {
            data: SlashCommandBuilder
            execute: Function
        };
        commands.push(command.data.toJSON());
    }

    const rest = new REST({
        version: '10'
    }).setToken(token);

    let type;
    const location = interaction.options.getString('location')
    if (location === 'global') {
        type = Routes.applicationCommands(clientId);
    } else {
        type = Routes.applicationGuildCommands(clientId, location || '');
    }

    rest.put(type, {
        body: commands
    })
        .then(() => {
            interaction.editReply('Commands have been deployed.');
        })
        .catch(err => {
            console.error(err);
            interaction.editReply('Something went wrong!');
        });
}