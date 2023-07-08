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
const db = require('./database.js');
const config = db.prepare('SELECT rulesChannel FROM config WHERE guildId = ?');
const { clientId } = require('./config.json');
const fs = require('fs');
module.exports = {
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rulesChannel } = config.get(interaction.guildId);
            const channelrules = interaction.client.channels.cache.get(rulesChannel);
            const webhooks = yield channelrules.fetchWebhooks();
            let channelWebhook = webhooks.first();
            let createdWebhook;
            if (!channelWebhook) {
                yield channelrules.createWebhook('Rules', {
                    avatar: 'https://cdn.discordapp.com/icons/563020189604773888/e238c167354de75db9b5b5a23af93736.png'
                }).then(webhook => {
                    channelWebhook = webhook;
                });
                yield interaction.editReply({
                    content: 'Webhook created',
                    ephemeral: true
                });
                createdWebhook = true;
            }
            if (channelWebhook.owner.id !== clientId) {
                yield interaction.editReply({
                    content: 'Rules webhook was not created by the bot.',
                    ephemeral: true
                });
                return;
            }
            const content = yield fs.readFileSync('./rules.md', 'utf8');
            yield channelWebhook.send(content);
            const reply = {
                content: 'Rules messages created',
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
};
//# sourceMappingURL=setupRules.js.map