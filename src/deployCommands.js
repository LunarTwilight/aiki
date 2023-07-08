const fs = require('fs');
const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

module.exports = {
    async execute (interaction) {
        const commands = [];
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({
            version: '10'
        })
            .setToken(token);

        let type;
        if (interaction.options.getString('location') === 'global') {
            type = Routes.applicationCommands(clientId);
        } else {
            type = Routes.applicationGuildCommands(clientId, interaction.options.getString('location'));
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
};