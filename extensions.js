const { GuildMember, PermissionFlagsBits } = require('discord.js');
const getConfig = require('./config.js');

function initExtensions () {
    Object.defineProperty(GuildMember.prototype, 'isMod', {
        get () {
            const { modRole } = getConfig(this.guild.id);
            return (this.permissions.has([
                PermissionFlagsBits.Administrator,
                PermissionFlagsBits.ModerateMembers
            ], false) || this.roles.cache.has(modRole));
        },
        configurable: true,
        enumerable: true
    });
}

module.exports = initExtensions;