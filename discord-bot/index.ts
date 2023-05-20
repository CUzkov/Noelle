import {Client, Events, GatewayIntentBits} from 'discord.js';

import {logger, getSecret, wait, Secrets} from 'lib';
import {startUpdateStatusChannel, startHandleButtonsInteractions} from 'tasks';

process.on('unhandledRejection', async (reason) => {
    logger.error(reason);

    await wait(1000);
    process.exit();
});

process.on('uncaughtException', async (err) => {
    logger.error({err}, 'Uncaught Exception');

    await wait(1000);
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

    startUpdateStatusChannel(client);
    startHandleButtonsInteractions(client);
})();
