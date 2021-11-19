const { Client, Intents, Collection } = require('discord.js');
const { token, devId, guildId, muteRole, modChanel } = require('./config.json');
const fs = require('fs');
const Database = require('better-sqlite3');
const cron = require('node-cron');
const db = new Database('db.sqlite', {
    fileMustExist: true
});
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
    process.send('ready');
});

cron.schedule('0 * * * *', () => {
    db.backup(`/backups/backup-${Date.now()}.sqlite`)
        .then(() => {
            console.log('backup complete!');
        })
        .catch((err) => {
            console.log('backup failed:', err);
        });
});

const getMutes = db.prepare('SELECT userid FROM mutes WHERE expiry < ?');
const removeMuteRow = db.prepare('DELETE FROM mutes WHERE userid = ?');
cron.schedule('0/15 * * * *', () => {
    const expiredMutes = getMutes.all(Date.now());
    expiredMutes.forEach(async userid => {
        const server = client.guides.cache.get(guildId);
        const user = await server.members.fetch(userid);
        user.roles.remove(muteRole);
        server.channels.cache.get(modChanel).send('<@' + userid + '> has been unmuted.');
        removeMuteRow.run(userid);
    });
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('a!')) {
        return;
    }
    const bareContent = message.content.substring(2);
    const cmd = bareContent.match(/(\w+) ?/)[1];
    const msg = / /.test(bareContent) ? bareContent.match(/\w+ (.*)/)[1] : null;
    const isDev = devId === message.author.id;

    if (cmd === 'test') {
        message.channel.send('hi');
    }
    if (cmd === 'eval' && isDev) {
        await message.channel.send('Something happened.');
        eval(msg);
    }
    if (cmd === 'die' && isDev) {
        await message.channel.send('bye.');
        process.exit();
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return;
    }

    try {
        await command.execute(interaction, db);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
});

client.login(token);