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
            return (this.roles.cache.has(modRole));
        },
        configurable: true,
        enumerable: true
    });
}

module.exports = initExtensions;