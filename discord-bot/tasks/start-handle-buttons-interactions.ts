import {ActionRowBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';
import {Client, Events} from 'discord.js';

import {McServerStatus, YcInstanceStatus, getYcInstanceInfo, startYcInstance, stopYcInstance} from 'api';
import {
    getYCInstanceIdFromCustomId,
    isCustomIdForYCInstance,
    YC_INSTANCE_START_PREFIX,
    getYcInstanceControlButton,
    YC_INSTANCE_STOP_PREFIX,
} from 'components/yc-server-button';
import {
    getMcServerFromCustomId,
    isCustomIdForMCServer,
    MC_SERVER_START_PREFIX,
    getMcServerButton,
} from 'components/mc-server-button';
import {getMcServersSharedData, logger, execSshCommand, getSecret, Secrets} from 'lib';

const FOUR_MINUT = 4 * 60 * 1_000;

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

            logger.info(`Instance ${instanceId} starting`);
        }

        if (isCustomIdForYCInstance({customId: interaction.customId, prefix: YC_INSTANCE_STOP_PREFIX})) {
            const instanceId = getYCInstanceIdFromCustomId({
                customId: interaction.customId,
                prefix: YC_INSTANCE_STOP_PREFIX,
            });

            const {status} = await getYcInstanceInfo(instanceId);

            if (status !== YcInstanceStatus.running) {
                logger.error(`Yc instance ${instanceId} not running`);
                await interaction.update({});
                return;
            }

            await stopYcInstance(instanceId);

            const messageButton = getYcInstanceControlButton({status: YcInstanceStatus.stopping, instanceId});
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.update({
                components: [messageActionRow],
            });

            logger.info(`Instance ${instanceId} stopping`);
        }

        if (isCustomIdForMCServer({customId: interaction.customId, prefix: MC_SERVER_START_PREFIX})) {
            const now = new Date().getTime();
            const serverId = getMcServerFromCustomId({prefix: MC_SERVER_START_PREFIX, customId: interaction.customId});
            const serverSharedData = await getMcServersSharedData();

            if (serverSharedData.get(serverId.name)) {
                await interaction.update({});
                return;
            }

            const {status: ycInstanceStatus} = await getYcInstanceInfo(serverId.ycInstanceId);

            if (ycInstanceStatus !== YcInstanceStatus.running) {
                logger.error(`Yc instance ${serverId.ycInstanceId} not started`);
                await interaction.update({});
                return;
            }

            const mcStartConfig = (await getSecret(Secrets.ycInstanceConfig)).find(
                ({instanceId}) => serverId.ycInstanceId === instanceId,
            );

            if (!mcStartConfig) {
                logger.error(`Cannot find mc server with name ${serverId.name} start config`);
                await interaction.update({});
                return;
            }

            execSshCommand({
                command: mcStartConfig.startCommand,
                config: {
                    host: mcStartConfig.host,
                    privateKey: Buffer.from(mcStartConfig.privateKey, 'base64').toString('utf-8'),
                    username: mcStartConfig.login,
                },
            });

            const messageButton = getMcServerButton({
                serverId,
                serverStatus: McServerStatus.intermediate,
                ycInstanceStatus,
                isWaitForStarting: true,
                timeLeftForRetry: FOUR_MINUT,
            });
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.update({
                components: [messageActionRow],
            });

            serverSharedData.set(serverId.name, {isWaitForStarting: true, lastTryTime: now}, FOUR_MINUT);
            logger.info(`Mc server ${mcStartConfig.serverName} starting`);
        }
    });
};
