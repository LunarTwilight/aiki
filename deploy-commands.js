const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);
const type = process.argv.slice(2)[0] === 'global' ? Routes.applicationCommands(clientId) : Routes.applicationGuildCommands(clientId, process.argv.slice(2)[0]);

rest.put(type, { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);