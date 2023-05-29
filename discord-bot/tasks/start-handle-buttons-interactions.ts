import {Client, Events} from 'discord.js';

import {
    McServerStatus,
    YcInstanceStatus,
    getMcServerStatus,
    getYcInstanceInfo,
    startYcInstance,
    stopYcInstance,
} from 'api';
import {
    getYcInstanceIdFromCustomId,
    isCustomIdForYCInstance,
    YC_INSTANCE_START_PREFIX,
    YC_INSTANCE_STOP_PREFIX,
} from 'components/yc-server-button';
import {getMcServerFromCustomId, isCustomIdForMCServer, MC_SERVER_START_PREFIX} from 'components/mc-server-button';
import {getServerCardButtons} from 'components/server-card';
import {Secrets, getSecret} from 'lib/get-secret';
import {logger} from 'lib/logger';
import {getMcServerTimeLeftToRetryStart} from 'lib/mc-server';
import {getMcServersSharedData} from 'lib/get-mc-servers-shared-data';
import {execSshCommand} from 'lib/ssh';

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

            const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);
            const config = ycInstanceConfig.find(
                ({ycInstanceId: currYcInstanceId}) => currYcInstanceId === ycInstanceId,
            );

            if (!config) {
                logger.error(`Config for yc instance ${ycInstanceId} not found`);
                await interaction.update({});
                return;
            }

            const {host, mcServerName, mcServerPort} = config;
            const {ycInstanceStatus, ycInstanceName} = await getYcInstanceInfo(ycInstanceId);
            const mcServerInfo = await getMcServerStatus({host, serverPort: mcServerPort});
            const mcServertimeLeftForRetryStart = await getMcServerTimeLeftToRetryStart({mcServerName});

            const buttons = getServerCardButtons({
                ycInstanceId,
                ycInstanceName,
                ycInstanceStatus,
                mcServerName,
                mcServerInfo,
                mcServertimeLeftForRetryStart,
            });

            await interaction.update({components: [buttons]});

            logger.info(`Instance ${ycInstanceId} starting`);
        }

        if (isCustomIdForYCInstance({customId: interaction.customId, prefix: YC_INSTANCE_STOP_PREFIX})) {
            const ycInstanceId = getYcInstanceIdFromCustomId({
                customId: interaction.customId,
                prefix: YC_INSTANCE_STOP_PREFIX,
            });

            if ((await getYcInstanceInfo(ycInstanceId)).ycInstanceStatus !== YcInstanceStatus.running) {
                logger.error(`Yc instance ${ycInstanceId} not running`);
                await interaction.update({});
                return;
            }

            await stopYcInstance(ycInstanceId);

            const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);
            const config = ycInstanceConfig.find(
                ({ycInstanceId: currYcInstanceId}) => currYcInstanceId === ycInstanceId,
            );

            if (!config) {
                logger.error(`Config for yc instance ${ycInstanceId} not found`);
                await interaction.update({});
                return;
            }

            const {host, mcServerName, mcServerPort} = config;
            const {ycInstanceStatus, ycInstanceName} = await getYcInstanceInfo(ycInstanceId);
            const mcServerInfo = await getMcServerStatus({host, serverPort: mcServerPort});
            const mcServertimeLeftForRetryStart = await getMcServerTimeLeftToRetryStart({mcServerName});

            const buttons = getServerCardButtons({
                ycInstanceId,
                ycInstanceName,
                ycInstanceStatus,
                mcServerName,
                mcServerInfo,
                mcServertimeLeftForRetryStart,
            });

            await interaction.update({components: [buttons]});
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

            if ((await getYcInstanceInfo(ycInstanceId)).ycInstanceStatus !== YcInstanceStatus.running) {
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

            const {ycInstanceStatus, ycInstanceName} = await getYcInstanceInfo(ycInstanceId);
            const mcServertimeLeftForRetryStart = await getMcServerTimeLeftToRetryStart({mcServerName});

            const buttons = getServerCardButtons({
                ycInstanceId,
                ycInstanceName,
                ycInstanceStatus,
                mcServerName,
                mcServerInfo: {
                    maxPlayers: 0,
                    playersOnline: 0,
                    status: McServerStatus.intermediate,
                    favicon: '',
                },
                mcServertimeLeftForRetryStart,
            });

            await interaction.update({components: [buttons]});

            serverSharedData.set(mcServerName, {isWaitForStarting: true, lastTryTime: now}, FOUR_MINUT);
            logger.info(`Mc server ${mcStartConfig.mcServerName} starting`);
        }
    });
};
