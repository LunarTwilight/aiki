const { Client, Intents, Collection } = require('discord.js');
const { token, guildId, muteRole, modChanel, renameLogChannel } = require('./config.json');
const fs = require('fs');
const Database = require('better-sqlite3');
const cron = require('node-cron');
const stringSimilarity = require('string-similarity');
const db = new Database('db.sqlite', {
    fileMustExist: true
});
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
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
    expiredMutes.forEach(async row => {
        const server = client.guides.cache.get(guildId);
        const user = await server.members.fetch(row.userid);
        user.roles.remove(muteRole);
        server.channels.cache.get(modChanel).send('<@' + row.userid + '> has been unmuted.');
        removeMuteRow.run(row.userid);
    });
});

client.on('userUpdate', async (oldUser, newUser) => {
    console.log(oldUser, newUser);
});

client.on('messageCreate', async message => {
    if (message.author.bot) {
        return;
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