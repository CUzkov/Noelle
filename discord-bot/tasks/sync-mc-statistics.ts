import {Client} from 'node-scp';
import {mkdirSync, existsSync} from 'fs';

import {getMcServerStatsPath} from 'lib/paths';
import {wait} from 'lib/wait';
import {getSecret, Secrets} from 'lib/get-secret';
import {logger} from 'lib/logger';
import {getYcInstanceInfo, YcInstanceStatus} from 'api';

export const syncMcStatistics = async () => {
    while (true) {
        await wait(15_000);

        const config = await getSecret(Secrets.ycInstanceConfig);

        for (let i = 0; i < config.length; i++) {
            const {mcServerStatsPath, host, login, mcServerName, privateKey, ycInstanceId} = config[i];
            const localpath = getMcServerStatsPath({mcServerName});

            const {ycInstanceStatus} = await getYcInstanceInfo(ycInstanceId);

            if (ycInstanceStatus !== YcInstanceStatus.running) {
                continue;
            }

            try {
                if (!existsSync(localpath)) {
                    mkdirSync(localpath, {recursive: true});
                }

                const client = await Client({
                    host,
                    username: login,
                    privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
                });

                await client.downloadDir(mcServerStatsPath, localpath);

                client.close();
            } catch (error) {
                logger.error(error);
            }
        }
    }
};
