const { Client, Intents } = require('discord.js');
const { token, devId } = require('./config.json');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ]
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    message.channel.send('got message');
});
client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) {
        return;
    }

    if (interaction.commandName === 'echo') {
        interaction.reply(interaction.options.getString('input'));
    }
    if (interaction.commandName === 'eval') {
        if (interaction.user.id !== devId) {
            return interaction.reply('no');
        }
        interaction.reply('something happened ig');
        eval(interaction.options.getString('input'));
        return;
    }
    if (interaction.commandName === 'eval') {
        if (interaction.user.id !== devId) {
            return interaction.reply('no');
        }
        interaction.reply('bye');
        return process.exit();
    }
});

client.login(token);