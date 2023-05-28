import {Client, Events, GatewayIntentBits} from 'discord.js';

import {logger, getSecret, Secrets, getMcServersSharedData} from 'lib';
import {startUpdateStatusChannel, startHandleButtonsInteractions, syncMcStatistics} from 'tasks';

process.on('unhandledRejection', async (reason) => {
    logger.error(reason);
    process.exit();
});

process.on('uncaughtException', async (err) => {
    logger.error({err}, 'Uncaught Exception');
    process.exit();
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
