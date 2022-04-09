const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blocked')
        .setDescription('Gives information on what to do when you are blocked'),

    async execute (interaction) {
        const button = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('blocked-global')
                .setLabel("I'm globally blocked")
                .setStyle('PRIMARY'),

            new MessageButton()
                .setCustomId('blocked-local')
                .setLabel("I'm locally blocked")
                .setStyle('PRIMARY'),
            
            new MessageButton()
                .setURL('https://c.fandom.com/wiki/Help:I_have_been_blocked')
                .setLabel('General help page')
                .setStyle('LINK')
        );

        await interaction.reply({
            content:
                "Blocked? Don't panic! See the linked pages for information on what to do. \n\nNote: **Do __not__ create a seperate account**, that is considered [sockpuppetry](https://c.fandom.com/Help:Sockpuppetry). Instead, follow the instructions in the linked help page.",
            components: [button]
        });
    },
};
