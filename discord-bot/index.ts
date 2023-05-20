import {logger, getSecret, wait, Secrets} from 'lib';

process.on('unhandledRejection', async (reason) => {
    logger.error(reason);

    await wait(1000);
    process.exit(1);
});

process.on('uncaughtException', async (err) => {
    logger.error({err}, 'Uncaught Exception');

    await wait(1000);
    process.exit(1);
});

(async () => {
    const config = await getSecret(Secrets.discordStatusChannelId);

    console.log(config);
})();
