import {Client} from 'discord.js';

import {McServerStatus, getMcServerStatus, getYcInstanceInfo} from 'api';
import {Secrets, getMcServersSharedData, getSecret, logger, wait} from 'lib';
import {getYCInstanceComponent} from 'components/yc-server-buttons-manager';
import {editMessagesComponents, sendComponents, Components} from 'lib/components';
import {getMcServerComponent} from 'components/mc-server-buttons-manager';

export const startUpdateStatusChannel = async (client: Client) => {
    while (true) {
        await wait(15_000);

        const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);

        const components: Components[] = [];

        const componentsPromises = ycInstanceConfig.map(
            async ({instanceId: ycInstanceId, serverName, serverPort, host}) => {
                const {status: ycInstanceStatus, name: ycInstanceName} = await getYcInstanceInfo(ycInstanceId);
                components.push(
                    ...getYCInstanceComponent({
                        instanceId: ycInstanceId,
                        status: ycInstanceStatus,
                        instanceName: ycInstanceName,
                    }),
                );

                const serverInfo = await getMcServerStatus({host, serverPort});
                const mcServerSharedData = (await getMcServersSharedData()).get(serverName);

                const isWaitForStarting = Boolean(mcServerSharedData?.isWaitForStarting);
                const timeLeftForRetry = isWaitForStarting
                    ? Math.round((new Date().getTime() - (mcServerSharedData?.lastTryTime ?? 0)) / 1000)
                    : 0;

                components.push(
                    ...getMcServerComponent({
                        host,

                        serverName,
                        serverPort,
                        serverInfo: {
                            ...serverInfo,
                            status: isWaitForStarting ? McServerStatus.intermediate : serverInfo.status,
                        },

                        ycInstanceId,
                        ycInstanceStatus,

                        isWaitForStarting,
                        timeLeftForRetry,
                    }),
                );
            },
        );

        await Promise.all(componentsPromises);

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
