import {Client} from 'discord.js';

import {getMcServerStatus, getYcInstanceInfo} from 'api';
import {editMessagesComponents, sendComponents, Components} from 'lib/components';
import {getServerCard} from 'components/server-card';
import {Secrets, getSecret} from 'lib/get-secret';
import {getMcServerTimeLeftToRetryStart} from 'lib/mc-server';
import {wait} from 'lib/wait';
import {logger} from 'lib/logger';

export const startUpdateStatusChannel = async (client: Client) => {
    while (true) {
        await wait(15_000);

        const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);

        const components: Components[] = [];

        for (let i = 0; i < ycInstanceConfig.length; i++) {
            const {ycInstanceId, mcServerName, mcServerPort, host} = ycInstanceConfig[i];
            const {ycInstanceStatus, ycInstanceName} = await getYcInstanceInfo(ycInstanceId);
            const mcServerInfo = await getMcServerStatus({host, serverPort: mcServerPort});
            const mcServertimeLeftForRetryStart = await getMcServerTimeLeftToRetryStart({mcServerName});

            components.push(
                ...getServerCard({
                    host,
                    ycInstanceId,
                    ycInstanceName,
                    ycInstanceStatus,
                    mcServerName,
                    mcServerPort,
                    mcServerInfo,
                    mcServertimeLeftForRetryStart,
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
