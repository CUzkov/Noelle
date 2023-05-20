import {ActionRowBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';

import {getYcInstanceInfo, startYcInstance} from 'api';
import {
    getYCInstanceIdFromCustomId,
    isCustomIdForYCInstance,
    YC_INSTANCE_START_PREFIX,
    getYcInstanceControlButton,
} from 'components/yc-server-buttons-manager';
import {Client, Events} from 'discord.js';

export const startHandleButtonsInteractions = async (client: Client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton()) return;

        if (isCustomIdForYCInstance({customId: interaction.customId, prefix: YC_INSTANCE_START_PREFIX})) {
            const instanceId = getYCInstanceIdFromCustomId({
                customId: interaction.customId,
                prefix: YC_INSTANCE_START_PREFIX,
            });
            const {status} = await getYcInstanceInfo(instanceId);
            await startYcInstance(instanceId);

            const messageButton = getYcInstanceControlButton({status, instanceId});
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            interaction.editReply({
                components: [messageActionRow],
            });
        }
    });
};
