const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        if (!interaction.isButton() || !interaction.customId.startsWith('roles-')) {
            return;
        }

        if (interaction.customId.match(/roles-addllanguages/)) {
            const rowLanguageA = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('roles-826043787364139021').setLabel('Arabic').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043961297731584').setLabel('Bulgarian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043893778219008').setLabel('Catalan').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043905757151252').setLabel('Croatian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043496950661161').setLabel('Czech').setStyle('SECONDARY')
            );
            const rowLanguageB = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('roles-826043866544078918').setLabel('Danish').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697701186109450').setLabel('Dutch').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043883279613982').setLabel('Estonian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697806982971428').setLabel('Finnish').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043650218655784').setLabel('Greek').setStyle('SECONDARY')
            );
            const rowLanguageC = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('roles-826043836232106014').setLabel('Hebrew').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043945331064842').setLabel('Hindi').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043562897965067').setLabel('Hungarian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697685134245888').setLabel('Indonesian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697665618149377').setLabel('Korean').setStyle('SECONDARY')
            );
            const rowLanguageD = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('roles-826043774005411880').setLabel('Malay').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697828508401675').setLabel('Norwegian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826044236032901120').setLabel('Persian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826043729302257664').setLabel('Romanian').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826044250235076608').setLabel('Serbian').setStyle('SECONDARY')
            );
            const rowLanguageE = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('roles-597697765010833410').setLabel('Swedish').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-826044195985686569').setLabel('Tagalog').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697722081869836').setLabel('Thai').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-597697739949867018').setLabel('Turkish').setStyle('SECONDARY'),
                new MessageButton().setCustomId('roles-598262772479819826').setLabel('Ukrainian').setStyle('SECONDARY')
            );
            const rowLanguageF = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('roles-597697646504837130').setLabel('Vietnamese').setStyle('SECONDARY')
            );
            await interaction.reply({
                content: 'Select additional roles',
                components: [rowLanguageA, rowLanguageB, rowLanguageC, rowLanguageD, rowLanguageE, rowLanguageF],
                ephemeral: true
            });
            return;
        }

        const roleId = interaction.customId.replace(/^roles-/, '');
        const { roles } = interaction.member;
        const hasRole = roles.cache.has(roleId);
        if (hasRole) {
            await roles.remove(roleId).catch(console.error);
        } else {
            await roles.add(roleId).catch(console.error);
        }
        await interaction.reply({
            content: `You have been successfully ${hasRole ? 'removed' : 'added'} the <@&${roleId}> role.`,
            ephemeral: true
        });
    }
};