import {Client} from 'discord.js';

import {getYcInstanceInfo} from 'api';
import {Secrets, getSecret, logger, wait} from 'lib';
import {getYCInstanceComponent} from 'components/yc-server-buttons-manager';
import {editMessagesComponents, sendComponents, Components} from 'lib/components';

export const startUpdateStatusChannel = async (client: Client) => {
    while (true) {
        await wait(15_000);

        const ycInstanceConfig = await getSecret(Secrets.ycInstanceConfig);

        const components: Components[] = [];

        ycInstanceConfig.forEach(async ({instanceId}) => {
            const {status, name} = await getYcInstanceInfo(instanceId);
            components.push(...getYCInstanceComponent({instanceId, status, instanceName: name}));
        });

        const channel = client.channels.cache.get(await getSecret(Secrets.discordStatusChannelId));

        if (!channel || !channel.isTextBased()) {
            logger.fatal('Given status channel not exist or not text based');
            process.exit();
        }

        const channelMessages = await channel.messages.fetch({limit: 100});

        console.log(channelMessages.size, components.length);

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
