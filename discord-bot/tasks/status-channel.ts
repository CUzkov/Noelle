import {Client} from 'discord.js';

import {getMcServerStatus, getYcInstanceInfo} from 'api';
import {Secrets, getMcServersSharedData, getSecret, logger, wait} from 'lib';
import {editMessagesComponents, sendComponents, Components} from 'lib/components';
import {getServerCard} from 'components/server-card';

export const startUpdateStatusChannel = async (client: Client) => {
    while (true) {
        await wait(15_000);

        const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);

        const components: Components[] = [];

        for (let i = 0; i < ycInstanceConfig.length; i++) {
            const {
                instanceId: ycInstanceId,
                serverName: mcServerName,
                serverPort: mcServerPort,
                host,
            } = ycInstanceConfig[i];

            const {status: ycInstanceStatus, name: ycInstanceName} = await getYcInstanceInfo(ycInstanceId);

            const mcServerInfo = await getMcServerStatus({host, serverPort: mcServerPort});
            const mcServerSharedData = (await getMcServersSharedData()).get(mcServerName);

            const isWaitForStarting = Boolean(mcServerSharedData?.isWaitForStarting);
            const timeLeftForRetry = isWaitForStarting
                ? Math.round((new Date().getTime() - (mcServerSharedData?.lastTryTime ?? 0)) / 1000)
                : 0;

            components.push(
                ...getServerCard({
                    host,
                    ycInstanceId,
                    ycInstanceName,
                    ycInstanceStatus,
                    mcServerName,
                    mcServerPort,
                    mcServerInfo,
                    isWaitForStartingMcServer: isWaitForStarting,
                    timeLeftForRetryStartMcServer: timeLeftForRetry,
                }),
            );
        }

        const channel = client.channels.cache.get(await getSecret(Secrets.discordStatusChannelId));

        if (!channel || !channel.isTextBased()) {
            logger.fatal('Given status channel not exist or not text based');
            process.exit();
        }

        const channelMessages = await channel.messages.fetch({limit: 100});

        if (channelMessages.size !== components.length) {
            for (let i = 0; i < channelMessages.size; i++) {
                const message = channelMessages.at(i);
                message && (await channel.messages.delete(message));
            }

            await sendComponents({channel, components});
        } else {
            await editMessagesComponents({messages: channelMessages, components});
        }
    }
};
