import {Client, Events, GatewayIntentBits} from 'discord.js';

import {startUpdateStatusChannel, startHandleButtonsInteractions, syncMcStatistics} from 'tasks';
import {logger} from 'lib/logger';
import {Secrets, getSecret} from 'lib/get-secret';
import {getMcServersSharedData} from 'lib/get-mc-servers-shared-data';

process.on('unhandledRejection', async (reason) => {
    logger.error(reason);
    process.exit(-1);
});

process.on('uncaughtException', async (err) => {
    logger.error({err}, 'Uncaught Exception');
    process.exit(-1);
});

(async () => {
    const discordToken = await getSecret(Secrets.discordToken);

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.MessageContent,
        ],
    });

    client.once(Events.ClientReady, (c) => {
        logger.info(`Ready! Logged in as ${c.user.tag}`);
    });

    client.login(discordToken);

    await getMcServersSharedData();

    startUpdateStatusChannel(client);
    startHandleButtonsInteractions(client);
    syncMcStatistics();
})();
