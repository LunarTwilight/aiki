import { Message } from "discord.js";
import db from "../database";

const config = db.prepare('SELECT verifiedRole FROM config WHERE guildId = ?');
const getResponse = db.prepare('SELECT response FROM customResponses WHERE guildId = ? AND trigger = ?');
const excluded = ['!wiki', '!report', '!soap'];

export default {
    name: 'messageCreate',
    async execute (message: Message<true>) {
        const { verifiedRole } = config.get(message.guild.id) as {
            verifiedRole: string
        };
        if (
            !message.content.startsWith('!') ||
            excluded.some(prefix => message.content.startsWith(prefix)) ||
            !message.member?.roles.cache.has(verifiedRole)
        ) {
            return;
        }
        const msg = message.content.slice(1).replace(/(.\S+).*/, '$1').trim();
        const row = getResponse.get(message.guild.id, msg) as {
            response?: string
        };
        if (!row?.response) {
            return;
        }
        await message.channel.send(row.response);
    }
};