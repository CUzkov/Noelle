import {Client} from 'discord.js';

import {getMcServerStatus, getYcInstanceInfo} from 'api';
import {Secrets, getSecret, logger, wait, getMcServerTimeLeftToRetryStart} from 'lib';
import {editMessagesComponents, sendComponents, Components} from 'lib/components';
import {getServerCard} from 'components/server-card';

export const startUpdateStatusChannel = async (client: Client) => {
    while (true) {
        await wait(5_000);

        console.log('Update status channel starting');

        const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);

        console.log('Secret recived');

        const components: Components[] = [];

        for (let i = 0; i < ycInstanceConfig.length; i++) {
            const {ycInstanceId, mcServerName, mcServerPort, host} = ycInstanceConfig[i];

            console.log(`Start building components for ${ycInstanceId}`);

            const {ycInstanceStatus, ycInstanceName} = await getYcInstanceInfo(ycInstanceId);

            console.log(`Recived yc status for ${ycInstanceId}`);

            const mcServerInfo = await getMcServerStatus({host, serverPort: mcServerPort});

            console.log(`Recived mc status for ${ycInstanceId}`);

            const mcServertimeLeftForRetryStart = await getMcServerTimeLeftToRetryStart({mcServerName});

            console.log(`Recived mcServertimeLeftForRetryStart for ${ycInstanceId}`);

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

        console.log('Components builded');

        const channel = client.channels.cache.get(await getSecret(Secrets.discordStatusChannelId));

        console.log('Channel getted');

        if (!channel || !channel.isTextBased()) {
            logger.fatal('Given status channel not exist or not text based');
            process.exit();
        }

        const channelMessages = await channel.messages.fetch({limit: 100});

        console.log('Channel messages getted');

        if (channelMessages.size !== components.length) {
            for (let i = 0; i < channelMessages.size; i++) {
                const message = channelMessages.at(i);
                message && (await channel.messages.delete(message));
            }

            await sendComponents({channel, components});
        } else {
            await editMessagesComponents({messages: channelMessages, components});
        }

        console.log('Finish updeting');
    }
};
