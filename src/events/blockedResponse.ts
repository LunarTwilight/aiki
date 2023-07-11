import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from 'discord.js';

export default {
    name: 'interactionCreate',
    execute (interaction: Interaction) {
        if (
            !interaction.isButton() ||
            !interaction.customId.startsWith('blocked-')
        ) {
            return;
        }

        let button;

        switch (interaction.customId) {
        case 'blocked-global':
            button = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setURL(
                        'https://support.fandom.com/hc/en-us/requests/new?ticket_form_id=360000931094&tf_360017834073=__dc.my_account_is_blocked__&tf_1500002786382=fandom_block_global'
                    )
                    .setLabel('Contact Fandom staff')
                    .setStyle(ButtonStyle.Link)
            );

            interaction.reply({
                content: 'If you are accidentally caught in a global block targeted towards your username or IP address, please contact Fandom staff to remove it.\n\nIn order to effectively locate the block and look into the matter, you must include **all** of the information in the box you see while you\'re blocked (which can be seen when you try to edit a page), especially the block ID.',
                components: [button],
                ephemeral: true
            });
            break;

        case 'blocked-local': {
            const localBlockedMessage = `If you have been blocked on one community, and you do not know why, or you disagree with the reason, __stay calm__. Please do the following steps to appeal your block:
1. Post a message to your Talk Page or Message Wall, sending a nice message about appealing your block.
2. If they disallowed editing your talk or wall, try leaving them a message on [Community Central](https://c.fandom.com).
3. If they still won't appeal your block, you can simply wait it out (if it's not indefinite), or join another Fandom community.

**Note**: If they are abusing their rights (like blocking anyone who wants to edit), please contact another admin about the issue.
**If there are no other admins, please [contact Fandom staff](https://support.fandom.com/hc/en-us/requests/new?ticket_form_id=360000931094&tf_360017834073=__dc.my_account_is_blocked__&tf_1500002786382=fandom_block_local) asap**.`;

            interaction.reply({
                content: localBlockedMessage,
                ephemeral: true
            });
            break;
        }
        default:
            interaction.reply({
                content: 'Error: no subcommand specified!',
                ephemeral: true
            });
        }
    }
};