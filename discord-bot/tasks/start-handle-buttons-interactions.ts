import {ActionRowBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';
import {Client, Events} from 'discord.js';

import {YcInstanceStatus, startYcInstance} from 'api';
import {
    getYCInstanceIdFromCustomId,
    isCustomIdForYCInstance,
    YC_INSTANCE_START_PREFIX,
    getYcInstanceControlButton,
} from 'components/yc-server-buttons-manager';
import {
    getMcServerFromCustomId,
    isCustomIdForMCServer,
    MC_SERVER_START_PREFIX,
} from 'components/mc-server-buttons-manager';
import {logger} from 'lib';

export const startHandleButtonsInteractions = async (client: Client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton()) return;

        if (isCustomIdForYCInstance({customId: interaction.customId, prefix: YC_INSTANCE_START_PREFIX})) {
            const instanceId = getYCInstanceIdFromCustomId({
                customId: interaction.customId,
                prefix: YC_INSTANCE_START_PREFIX,
            });
            await startYcInstance(instanceId);

            const messageButton = getYcInstanceControlButton({status: YcInstanceStatus.starting, instanceId});
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.update({
                components: [messageActionRow],
            });

            logger.info(`Server ${instanceId} starting`);
        }

        if (isCustomIdForMCServer({customId: interaction.customId, prefix: MC_SERVER_START_PREFIX})) {
            const serverId = getMcServerFromCustomId({prefix: MC_SERVER_START_PREFIX, customId: interaction.customId});
        }
    });
};
