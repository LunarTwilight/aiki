"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const discord_js_1 = require("discord.js");
const database_1 = __importDefault(require("./database"));
const config_json_1 = require("./config.json");
const config = database_1.default.prepare('SELECT rolesChannel FROM config WHERE guildId = ?');
function execute(interaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { rolesChannel } = config.get(interaction.guildId);
        const channelroles = interaction.client.channels.cache.get(rolesChannel);
        if (!(channelroles === null || channelroles === void 0 ? void 0 : channelroles.isTextBased()) || channelroles.isDMBased() || channelroles.isThread())
            return;
        const webhooks = yield channelroles.fetchWebhooks();
        let channelWebhook = webhooks.first();
        let createdWebhook;
        if (!channelWebhook) {
            const webhook = yield channelroles.createWebhook({
                avatar: 'https://cdn.discordapp.com/icons/563020189604773888/e238c167354de75db9b5b5a23af93736.png',
                name: 'Roles'
            });
            channelWebhook = webhook;
            yield interaction.editReply({
                content: 'Webhook created'
            });
            createdWebhook = true;
        }
        if (((_a = channelWebhook.owner) === null || _a === void 0 ? void 0 : _a.id) !== config_json_1.clientId) {
            yield interaction.editReply({
                content: 'Roles webhook was not created by the bot.'
            });
            return;
        }
        const platform = 'Please select the platform to see its channels:';
        const rowPlatform = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-563020739330965524')
            .setLabel('Fandom')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('872100256999952436'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-563020873855008768')
            .setLabel('Gamepedia')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('591645534683398144'));
        const pronoun = 'Available pronoun roles:';
        const rowPronoun = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-574244445688692736')
            .setLabel('He/Him')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('💙'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-574244502366322699')
            .setLabel('She/Her')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('❤️'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-574244536142790686')
            .setLabel('They/Them')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('💕'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-574247670919593985')
            .setLabel('Other')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('💛'));
        const vertical = 'Available vertical roles:';
        const rowVertical = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-620721456745021441')
            .setLabel('Anime')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('🍥'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-620723846818824192')
            .setLabel('Books/Other')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('📚'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-620720867650830376')
            .setLabel('Gaming')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('🎮'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-620720994822389806')
            .setLabel('TV/Movies')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('📺'));
        const region = 'Select the region nearest your time zone:';
        const rowRegion = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-622894005247803412')
            .setLabel('Americas')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('🌎'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-622893997546930186')
            .setLabel('Asia/Oceania')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('🌏'), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-622890164351402005')
            .setLabel('Europe/Africa')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji('🌍'));
        const languageA = 'Available language roles:';
        const rowLanguageA = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-597697552833576982')
            .setLabel('Chinese')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-597697352698167306')
            .setLabel('French')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-577582442278289414')
            .setLabel('German')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-597697626741276681')
            .setLabel('Italian')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-597697612069732413')
            .setLabel('Japanese')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        const rowLanguageB = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-597697583418179585')
            .setLabel('Polish')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-597697501684039681')
            .setLabel('Portuguese/Brazilian')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-595523006034345985')
            .setLabel('Russian')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-589138036298743818')
            .setLabel('Spanish')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('roles-922428251459190814')
            .setLabel('English')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        const rowLanguageC = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('roles-addllanguages')
            .setLabel('Additional languages')
            .setStyle(discord_js_1.ButtonStyle.Primary));
        yield channelWebhook.send({
            content: platform,
            components: [rowPlatform]
        });
        yield channelWebhook.send({
            content: pronoun,
            components: [rowPronoun]
        });
        yield channelWebhook.send({
            content: vertical,
            components: [rowVertical]
        });
        yield channelWebhook.send({
            content: region,
            components: [rowRegion]
        });
        yield channelWebhook.send({
            content: languageA,
            components: [rowLanguageA, rowLanguageB, rowLanguageC]
        });
        const reply = {
            content: 'Roles messages created',
            ephemeral: true
        };
        if (createdWebhook) {
            yield interaction.followUp(reply);
        }
        else {
            yield interaction.editReply(reply);
        }
    });
}
exports.execute = execute;
//# sourceMappingURL=setupRoles.js.map