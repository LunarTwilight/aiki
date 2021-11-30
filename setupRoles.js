const { MessageActionRow, MessageButton } = require('discord.js');
const db = require('./database.js');
const config = db.prepare('SELECT rolesChannel FROM config WHERE guildId = ?');

module.exports = {
    async execute (interaction) {
        const { rolesChannel } = config.get(BigInt(interaction.guildId));
        const channelroles = interaction.client.channels.cache.get(rolesChannel.toString());

        if (interaction.options.getString('option') === 'webhook') {
            channelroles
                .createWebhook('Roles', {
                    avatar: 'https://cdn.discordapp.com/icons/563020189604773888/e238c167354de75db9b5b5a23af93736.png'
                })
                .then((webhook) => console.log(`Created webhook ${webhook}`))
                .catch(console.error);
            interaction.reply({
                content: 'Webhook created',
                ephemeral: true
            })
        }

        const platform = 'Please select the platform to see its channels:';
        const rowPlatform = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('roles-563020739330965524')
                .setLabel('Fandom')
                .setStyle('SECONDARY')
                .setEmoji('872100256999952436'),
            new MessageButton()
                .setCustomId('roles-563020873855008768')
                .setLabel('Gamepedia')
                .setStyle('SECONDARY')
                .setEmoji('591645534683398144')
        );
        const pronoun = 'Available pronoun roles:';
        const rowPronoun = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('roles-574244445688692736')
                .setLabel('He/Him')
                .setStyle('SECONDARY')
                .setEmoji('💙'),
            new MessageButton()
                .setCustomId('roles-574244502366322699')
                .setLabel('She/Her')
                .setStyle('SECONDARY')
                .setEmoji('❤️'),
            new MessageButton()
                .setCustomId('roles-574244536142790686')
                .setLabel('They/Them')
                .setStyle('SECONDARY')
                .setEmoji('💕'),
            new MessageButton().setCustomId('roles-574247670919593985').setLabel('Other').setStyle('SECONDARY').setEmoji('💛')
        );
        const vertical = 'Available vertical roles:';
        const rowVertical = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('roles-620720867650830376')
                .setLabel('Gaming')
                .setStyle('SECONDARY')
                .setEmoji('🎮'),
            new MessageButton()
                .setCustomId('roles-620720994822389806')
                .setLabel('TV/Movies')
                .setStyle('SECONDARY')
                .setEmoji('📺'),
            new MessageButton().setCustomId('roles-620721456745021441').setLabel('Anime').setStyle('SECONDARY').setEmoji('🍥'),
            new MessageButton()
                .setCustomId('roles-620723846818824192')
                .setLabel('Books/Other')
                .setStyle('SECONDARY')
                .setEmoji('📚')
        );
        const region = 'Select the region nearest your time zone:';
        const rowRegion = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('roles-622890164351402005')
                .setLabel('Europe/Africa')
                .setStyle('SECONDARY')
                .setEmoji('🌍'),
            new MessageButton()
                .setCustomId('roles-622893997546930186')
                .setLabel('Asia/Oceania')
                .setStyle('SECONDARY')
                .setEmoji('🌏'),
            new MessageButton()
                .setCustomId('roles-622894005247803412')
                .setLabel('Americas')
                .setStyle('SECONDARY')
                .setEmoji('🌎')
        );
        const languageA = 'Available language roles:';
        const rowLanguageA = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('roles-597697552833576982').setLabel('Chinese').setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-597697352698167306').setLabel('French').setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-577582442278289414').setLabel('German').setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-597697626741276681').setLabel('Italian').setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-597697612069732413').setLabel('Japanese').setStyle('SECONDARY')
        );
        const rowLanguageB = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('roles-597697583418179585').setLabel('Polish').setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('roles-597697501684039681')
                .setLabel('Portuguese/Brazilian')
                .setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-595523006034345985').setLabel('Russian').setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-589138036298743818').setLabel('Spanish').setStyle('SECONDARY'),
            new MessageButton().setCustomId('roles-597697646504837130').setLabel('Vietnamese').setStyle('SECONDARY')
        );
        const rowLanguageC = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('roles-addllanguages').setLabel('Additional languages').setStyle('PRIMARY')
        );
        try {
            const webhooks = await channelroles.fetchWebhooks();
            const webhook = webhooks.first();

            webhook
                .send({ content: platform, components: [rowPlatform] })
                .then(() => {
                    webhook
                        .send({ content: pronoun, components: [rowPronoun] })
                        .then(() => {
                            webhook
                                .send({ content: vertical, components: [rowVertical] })
                                .then(() => {
                                    webhook
                                        .send({ content: region, components: [rowRegion] })
                                        .then(() => {
                                            webhook.send({ content: languageA, components: [rowLanguageA, rowLanguageB, rowLanguageC] });
                                            interaction.reply({
                                                content: 'Roles messages created',
                                                ephemeral: true
                                            });
                                        })
                                        .catch(console.error);
                                })
                                .catch(console.error);
                        })
                        .catch(console.error);
                })
                .catch(console.error);
        } catch (error) {
            console.error(error);
        }
    }
};