const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js'); //eslint-disable-line no-redeclare
const { token, dsn } = require('./config.json');
const fs = require('fs');
const { collectDefaultMetrics, register } = require('prom-client');
const http = require('http');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing'); //eslint-disable-line no-unused-vars

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.GuildMember],
    presence: {
        activities: [{
            type: 'PLAYING',
            name: 'Love Brightness'
        }],
        status: 'idle'
    }
});

require('merida').init();

Sentry.init({
    dsn,
    tracesSampleRate: 1.0
});

collectDefaultMetrics({
    label: {
        name: 'aiki'
    }
});
http.createServer(async (req, res) => {
    try {
        res.setHeader('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.writeHead(500);
        res.end(err);
    }
}).listen(22022);

require('./keepChannelOrder.js').execute(client);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token);