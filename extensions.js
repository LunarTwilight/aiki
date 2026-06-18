const { GuildMember, PermissionFlagsBits } = require('discord.js');
const getConfig = require('./config.js');

function initExtensions () {
    Object.defineProperty(GuildMember.prototype, 'isMod', {
        get () {
            if (this.permissions.has(PermissionFlagsBits.Administrator)) {
                return true;
            }
            if (this.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return true;
            }
            const { modRole } = getConfig(this.guild.id);
            return (modRole ? this.roles.cache.has(modRole) : false);
        },
        configurable: true
    });
}

module.exports = initExtensions;