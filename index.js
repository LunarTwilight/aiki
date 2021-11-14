const { Client, Intents, Permissions, MessageEmbed } = require('discord.js'); // eslint-disable-line no-redeclare
const { parseDuration } = require('parse-duration');
const { token, devId } = require('./config.json');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.once('ready', () => {
    console.log('Ready!');
    process.send('ready');
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

    if (interaction.commandName === 'meme') {
        interaction.reply('https://i.kym-cdn.com/photos/images/newsfeed/001/311/521/6be.gif');
    }
    if (interaction.commandName === 'ping') {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        interaction.editReply(`:heartbeat: ${client.ws.ping}ms\n:repeat: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }
    if (interaction.commandName === 'staff') {
        interaction.reply('https://fandom.zendesk.com/hc/requests/new');
    }
    if (interaction.commandName === 'random') {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return interaction.reply({
                content: 'No.',
                ephemeral: true
            })
        }
        interaction.reply('The mods request that you move this convo to <#563024520101888010>.');
    }
    if (interaction.commandName === 'mute') {
        const member = interaction.options.getMember('user');
        if (member.roles.cache.has('909403377056751676')) {
            return interaction.reply({
                content: 'This user is already muted.',
                ephemeral: true
            });
        }
        await member.roles.add('909403377056751676');
        const muteEmbed = new MessageEmbed()
            .setTitle('User muted')
            .addFields({
                name: 'User',
                value: '<@' + member.id + '>',
                inline: true
            }, {
                name: 'Duration',
                value: interaction.options.getString('duration'),
                inline: true
            }, {
                name: 'Reason',
                value: interaction.options.getString('reason') ? interaction.options.getString('reason') : 'N/A',
                inline: true
            });
        await interaction.reply('User has been muted');
        await client.channels.cache.get('908998769926873099').send({
            embeds: [
                muteEmbed
            ]
        });
    }
    if (interaction.commandName === 'eval') {
        if (interaction.user.id !== devId) {
            return interaction.reply('no');
        }
        interaction.reply('something happened ig');
        eval(interaction.options.getString('input'));
        return;
    }
    if (interaction.commandName === 'die') {
        if (interaction.user.id !== devId) {
            return interaction.reply('no');
        }
        await interaction.reply('bye');
        return process.exit();
    }
});

client.login(token);