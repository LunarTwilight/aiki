const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Verify')
        .setType(ApplicationCommandType.Message)
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute () {
        //I don't know if this is used for this, but I'm also not sure what will happen if I don't include it
    }
};