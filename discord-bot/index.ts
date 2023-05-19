import {logger, getConfig, wait} from 'lib';

process.on('unhandledRejection', async (reason) => {
    logger.error(reason);
    console.log(reason);

    // Даём логеру отработать
    await wait(1000);

    process.exit(1);
});

process.on('uncaughtException', async (err) => {
    logger.error({err}, 'Uncaught Exception');
    console.log(err);

    // Даём логеру отработать
    await wait(1000);

    process.exit(1);
});

(async () => {
    console.log(1);

    const config = await getConfig();

    console.log(config);
})()
    .catch(async (reason) => {
        logger.error(reason);
        console.log(reason);
    
        // Даём логеру отработать
        await wait(1000);
    });
