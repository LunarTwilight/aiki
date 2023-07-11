import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from 'discord.js';

export default {
    name: 'interactionCreate',
    async execute (interaction: Interaction) {
        if (!interaction.isButton() || !interaction.customId.startsWith('roles-')) {
            return;
        }

        await interaction.deferReply({
            ephemeral: true
        });

        if (interaction.customId.match(/roles-addllanguages/)) {
            const rowLanguageA = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roles-826043787364139021').setLabel('Arabic').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043961297731584').setLabel('Bulgarian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043893778219008').setLabel('Catalan').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043905757151252').setLabel('Croatian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043496950661161').setLabel('Czech').setStyle(ButtonStyle.Secondary)
            );
            const rowLanguageB = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roles-826043866544078918').setLabel('Danish').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697701186109450').setLabel('Dutch').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043883279613982').setLabel('Estonian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697806982971428').setLabel('Finnish').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043650218655784').setLabel('Greek').setStyle(ButtonStyle.Secondary)
            );
            const rowLanguageC = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roles-826043836232106014').setLabel('Hebrew').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043945331064842').setLabel('Hindi').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043562897965067').setLabel('Hungarian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697685134245888').setLabel('Indonesian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697665618149377').setLabel('Korean').setStyle(ButtonStyle.Secondary)
            );
            const rowLanguageD = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roles-826043774005411880').setLabel('Malay').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697828508401675').setLabel('Norwegian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826044236032901120').setLabel('Persian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826043729302257664').setLabel('Romanian').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826044250235076608').setLabel('Serbian').setStyle(ButtonStyle.Secondary)
            );
            const rowLanguageE = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roles-597697765010833410').setLabel('Swedish').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-826044195985686569').setLabel('Tagalog').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697722081869836').setLabel('Thai').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-597697739949867018').setLabel('Turkish').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('roles-598262772479819826').setLabel('Ukrainian').setStyle(ButtonStyle.Secondary)
            );
            const rowLanguageF = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roles-597697646504837130').setLabel('Vietnamese').setStyle(ButtonStyle.Secondary)
            );
            await interaction.editReply({
                content: 'Select additional roles',
                components: [rowLanguageA, rowLanguageB, rowLanguageC, rowLanguageD, rowLanguageE]
            });
            await interaction.followUp({
                components: [rowLanguageF],
                ephemeral: true
            });
            return;
        }

        const roleId = interaction.customId.replace(/^roles-/, '');
        const roles = interaction.member?.roles;
        if ( !roles || Array.isArray(roles) ) return;
        const hasRole = roles.cache.has(roleId);
        if (hasRole) {
            await roles.remove(roleId).catch(console.error);
        } else {
            await roles.add(roleId).catch(console.error);
        }
        await interaction.editReply({
            content: `You have successfully ${hasRole ? 'removed' : 'added'} the <@&${roleId}> role.`
        });
    }
};