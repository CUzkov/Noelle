import {Client} from 'node-scp';

import {Secrets, getSecret, logger, wait} from 'lib';

export const syncMcStatistics = async () => {
    while (true) {
        await wait(15_000);

        const config = await getSecret(Secrets.ycInstanceConfig);

        for (let i = 0; i < config.length; i++) {
            const {mcServerStatsPath, host, login, mcServerName, privateKey} = config[i];

            try {
                const client = await Client({
                    host,
                    username: login,
                    privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
                });

                await client.downloadDir(`/home/cuzkov/${mcServerName}`, mcServerStatsPath);

                client.close();
            } catch (error) {
                logger.error(error);
            }
        }
    }
};
