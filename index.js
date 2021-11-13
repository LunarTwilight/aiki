const { Client, Intents } = require('discord.js');
const { token, devId } = require('./config.json');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    if (message.author.bot || !message.content.startsWith('a!')) {
        return;
    }
    const msg = message.content.substring(2);

    if (msg === 'test') {
        message.channel.send('hi');
    }
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