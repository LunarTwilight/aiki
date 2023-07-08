import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import db from './database';
import { clientId } from './config.json'
const config = db.prepare('SELECT rolesChannel FROM config WHERE guildId = ?');

export async function execute( interaction: ChatInputCommandInteraction ) {
    const { rolesChannel } = config.get(interaction.guildId) as { rolesChannel: string };
    const channelroles = interaction.client.channels.cache.get(rolesChannel);
    if ( !channelroles?.isTextBased() || channelroles.isDMBased() || channelroles.isThread() ) return;

    const webhooks = await channelroles.fetchWebhooks();
    let channelWebhook = webhooks.first();
    let createdWebhook;

    if (!channelWebhook) {
        const webhook = await channelroles.createWebhook({
            avatar: 'https://cdn.discordapp.com/icons/563020189604773888/e238c167354de75db9b5b5a23af93736.png',
            name: 'Roles'
        })
        channelWebhook = webhook
        await interaction.editReply({
            content: 'Webhook created'
        });
        createdWebhook = true;
    }
    if (channelWebhook.owner?.id !== clientId) {
        await interaction.editReply({
            content: 'Roles webhook was not created by the bot.'
        });
        return;
    }

    const platform = 'Please select the platform to see its channels:';
    const rowPlatform = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-563020739330965524')
            .setLabel('Fandom')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('872100256999952436'),
        new ButtonBuilder()
            .setCustomId('roles-563020873855008768')
            .setLabel('Gamepedia')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('591645534683398144')
    );
    const pronoun = 'Available pronoun roles:';
    const rowPronoun = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-574244445688692736')
            .setLabel('He/Him')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💙'),
        new ButtonBuilder()
            .setCustomId('roles-574244502366322699')
            .setLabel('She/Her')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❤️'),
        new ButtonBuilder()
            .setCustomId('roles-574244536142790686')
            .setLabel('They/Them')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💕'),
        new ButtonBuilder()
            .setCustomId('roles-574247670919593985')
            .setLabel('Other')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💛')
    );
    const vertical = 'Available vertical roles:';
    const rowVertical = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-620721456745021441')
            .setLabel('Anime')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🍥'),
        new ButtonBuilder()
            .setCustomId('roles-620723846818824192')
            .setLabel('Books/Other')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📚'),
        new ButtonBuilder()
            .setCustomId('roles-620720867650830376')
            .setLabel('Gaming')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🎮'),
        new ButtonBuilder()
            .setCustomId('roles-620720994822389806')
            .setLabel('TV/Movies')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📺')
    );
    const region = 'Select the region nearest your time zone:';
    const rowRegion = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-622894005247803412')
            .setLabel('Americas')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🌎'),
        new ButtonBuilder()
            .setCustomId('roles-622893997546930186')
            .setLabel('Asia/Oceania')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🌏'),
        new ButtonBuilder()
            .setCustomId('roles-622890164351402005')
            .setLabel('Europe/Africa')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🌍')
    );
    const languageA = 'Available language roles:';
    const rowLanguageA = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-597697552833576982')
            .setLabel('Chinese')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-597697352698167306')
            .setLabel('French')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-577582442278289414')
            .setLabel('German')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-597697626741276681')
            .setLabel('Italian')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-597697612069732413')
            .setLabel('Japanese')
            .setStyle(ButtonStyle.Secondary)
    );
    const rowLanguageB = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-597697583418179585')
            .setLabel('Polish')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-597697501684039681')
            .setLabel('Portuguese/Brazilian')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-595523006034345985')
            .setLabel('Russian')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-589138036298743818')
            .setLabel('Spanish')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roles-922428251459190814')
            .setLabel('English')
            .setStyle(ButtonStyle.Secondary)
    );
    const rowLanguageC = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('roles-addllanguages')
            .setLabel('Additional languages')
            .setStyle(ButtonStyle.Primary)
    );
    await channelWebhook.send({
        content: platform,
        components: [rowPlatform]
    });
    await channelWebhook.send({
        content: pronoun,
        components: [rowPronoun]
    });
    await channelWebhook.send({
        content: vertical,
        components: [rowVertical]
    });
    await channelWebhook.send({
        content: region,
        components: [rowRegion]
    });
    await channelWebhook.send({
        content: languageA,
        components: [rowLanguageA, rowLanguageB, rowLanguageC]
    });
    const reply = {
        content: 'Roles messages created',
        ephemeral: true
    };
    if (createdWebhook) {
        await interaction.followUp(reply);
    } else {
        await interaction.editReply(reply);
    }
}
