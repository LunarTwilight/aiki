const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../database.js');
const config = db.prepare('SELECT modRole FROM config WHERE guildId = ?');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bulkdelete')
        .setDescription('bulk deletes messages'),
    async execute (interaction) {
        const { modRole } = config.get(BigInt(interaction.guildId));
        if (!interaction.member.roles.cache.has(modRole.toString())) {
            return interaction.reply('You are not a mod, I\'d suggest you become one.');
        }
        //code goes here
    }
}