import {ActionRowBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';
import {Client, Events} from 'discord.js';

import {McServerStatus, YcInstanceStatus, getYcInstanceInfo, startYcInstance, stopYcInstance} from 'api';
import {
    getYcInstanceIdFromCustomId,
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
            const ycInstanceId = getYcInstanceIdFromCustomId({
                customId: interaction.customId,
                prefix: YC_INSTANCE_START_PREFIX,
            });
            await startYcInstance(ycInstanceId);

            const messageButton = getYcInstanceControlButton({
                ycInstanceStatus: YcInstanceStatus.starting,
                ycInstanceId,
            });
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.update({
                components: [messageActionRow],
            });

            logger.info(`Instance ${ycInstanceId} starting`);
        }

        if (isCustomIdForYCInstance({customId: interaction.customId, prefix: YC_INSTANCE_STOP_PREFIX})) {
            const ycInstanceId = getYcInstanceIdFromCustomId({
                customId: interaction.customId,
                prefix: YC_INSTANCE_STOP_PREFIX,
            });

            const {ycInstanceStatus} = await getYcInstanceInfo(ycInstanceId);

            if (ycInstanceStatus !== YcInstanceStatus.running) {
                logger.error(`Yc instance ${ycInstanceId} not running`);
                await interaction.update({});
                return;
            }

            await stopYcInstance(ycInstanceId);

            const messageButton = getYcInstanceControlButton({
                ycInstanceStatus: YcInstanceStatus.stopping,
                ycInstanceId,
            });
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.update({
                components: [messageActionRow],
            });

            logger.info(`Instance ${ycInstanceId} stopping`);
        }

        if (isCustomIdForMCServer({customId: interaction.customId, prefix: MC_SERVER_START_PREFIX})) {
            const now = new Date().getTime();
            const {ycInstanceId, mcServerName} = getMcServerFromCustomId({
                prefix: MC_SERVER_START_PREFIX,
                customId: interaction.customId,
            });
            const serverSharedData = await getMcServersSharedData();

            if (serverSharedData.get(mcServerName)) {
                await interaction.update({});
                return;
            }

            const {ycInstanceStatus} = await getYcInstanceInfo(ycInstanceId);

            if (ycInstanceStatus !== YcInstanceStatus.running) {
                logger.error(`Yc instance ${ycInstanceId} not started`);
                await interaction.update({});
                return;
            }

            const mcStartConfig = (await getSecret(Secrets.ycInstanceConfig)).find(
                ({ycInstanceId: currYcInstanceId}) => currYcInstanceId === ycInstanceId,
            );

            if (!mcStartConfig) {
                logger.error(`Cannot find mc server with name ${mcServerName} start config`);
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
                ycInstanceId,
                ycInstanceStatus,
                mcServerName,
                mcServerInfo: {
                    maxPlayers: 0,
                    playersOnline: 0,
                    status: McServerStatus.intermediate,
                    favicon: '',
                },
                mcServertimeLeftForRetryStart: FOUR_MINUT,
            });
            const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                messageButton,
            );

            await interaction.update({
                components: [messageActionRow],
            });

            serverSharedData.set(mcServerName, {isWaitForStarting: true, lastTryTime: now}, FOUR_MINUT);
            logger.info(`Mc server ${mcStartConfig.mcServerName} starting`);
        }
    });
};
