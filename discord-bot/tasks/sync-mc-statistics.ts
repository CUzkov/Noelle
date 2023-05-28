import {Client} from 'node-scp';
import {mkdirSync, existsSync} from 'fs';

import {Secrets, getSecret, logger, wait} from 'lib';

export const syncMcStatistics = async () => {
    while (true) {
        await wait(15_000);

        const config = await getSecret(Secrets.ycInstanceConfig);

        for (let i = 0; i < config.length; i++) {
            const {mcServerStatsPath, host, login, mcServerName, privateKey} = config[i];

            const localpath = `/home/cuzkov/${mcServerName.replace(/\s+/gi, '-').toLocaleLowerCase()}`;

            try {
                console.log(mcServerStatsPath, existsSync(localpath));

                if (!existsSync(localpath)) {
                    mkdirSync(localpath, {recursive: true});
                }

                console.log('start sync');

                const client = await Client({
                    host,
                    username: login,
                    privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
                });

                console.log('start download', mcServerStatsPath, localpath);

                await client.downloadDir(mcServerStatsPath, localpath);

                client.close();
            } catch (error) {
                logger.error(error);
            }
        }
    }
};
