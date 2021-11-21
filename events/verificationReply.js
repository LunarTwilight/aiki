const { verificationChannel, verifiedRole } = require('../config.json');
const db = require('../database.js');
const checkForIgnore = db.prepare('SELECT ignored FROM verificationIgnore WHERE userid = ?');
const checkForWillIgnore = db.prepare('SELECT willIgnore FROM verificationIgnore WHERE userid = ?');
const addIgnore = db.prepare('UPDATE verificationIgnore SET ignored = 1 WHERE userid = ?');
const addWillIgnore = db.prepare('INSERT INTO verificationIgnore (userid, ignored, willIgnore) VALUES (?, 0, 1)');

module.exports = {
    name: 'messageCreate',
    execute (message) {
        if (message.channelId !== verificationChannel || message.author.bot || message.member.roles.cache.has(verifiedRole)) {
            return;
        }

        if (checkForIgnore.get(message.author.id).ignored) {
            return;
        }

        if (checkForWillIgnore.get(message.author.id).willIgnore) {
            message.reply('It looks like you\'re having trouble verifying, please contact a moderator.');
            addIgnore.run(message.author.id);
            return;
        }

        if (/^hi|^hello|^yo/i.test(message.content)) {
            message.reply('Hi, please read the channel topic to see how to verify and access the rest of the server.');
            addWillIgnore.run(message.author.id);
        }
    }
};