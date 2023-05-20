import {ActionRowBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';

import {YcInstanceStatus, startYcInstance} from 'api';
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
            await startYcInstance(instanceId);

            const messageButton = getYcInstanceControlButton({status: YcInstanceStatus.starting, instanceId});
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.message.edit({
                components: [messageActionRow],
            });

            await interaction.reply({});
        }
    });
};
