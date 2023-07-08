import type { CommandInteraction } from 'discord.js';
import db from './database';

const makeRow = db.prepare('INSERT INTO channelPositions (guildId, channelId, position) VALUES (?, ?, ?)');

export async function execute( interaction: CommandInteraction ) {
    interaction.guild?.channels.cache.each( channel => {
        if ( channel.isThread() ) {
            return
        }
        makeRow.run( interaction.guildId, channel.id, channel.position )
    } )
    interaction.editReply('done')
}
