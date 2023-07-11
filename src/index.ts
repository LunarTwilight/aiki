import { Client, GatewayIntentBits, Collection, Partials, ActivityType } from 'discord.js';
import { token, dsn } from './config.json';
import fs from 'fs';
import { collectDefaultMetrics, register } from 'prom-client';
import http from 'http';
import Sentry from '@sentry/node';
import '@sentry/tracing'; //eslint-disable-line no-unused-vars

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.GuildMember
    ],
    presence: {
        activities: [{
            type: ActivityType.Playing,
            name: 'Love Brightness'
        }],
        status: 'idle'
    }
});

// @ts-expect-error - no typings
import( 'merida' ).then( merida => merida.init() );

Sentry.init({
    dsn,
    tracesSampleRate: 1.0
});

collectDefaultMetrics({
    labels: {
        name: 'aiki'
    }
});
http.createServer(async (_req, res) => {
    try {
        res.setHeader('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.writeHead(500);
        res.end(err);
    }
}).listen(22022);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    import(`./commands/${file}`).then( command => {
        client.commands.set( command.data.name, command ); 
    } );
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    import(`./events/${file}`).then( event => {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    } );
}

client.login(token);

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, unknown>
    }
}