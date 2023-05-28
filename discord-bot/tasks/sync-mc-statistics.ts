import Rsync from 'rsync';

import { Secrets, getSecret, logger, wait } from "lib";

export const syncMcStatistics = async () => {
    while (true) {
        await wait(15_000);

        const config = await getSecret(Secrets.ycInstanceConfig);

        for (let i = 0; i < config.length; i++) {
            const {mcServerStatsPath, host, login, mcServerName} = config[i];
            
            const rsync = new Rsync()
                .shell('ssh')
                .flags('az')
                .source(`${login}@${host}:${mcServerStatsPath}`)
                .destination(`/home/cuzkov/stats/${mcServerName}`);
            
            rsync.execute((error, code, cmd) => {
                logger.error(error, code, cmd);
            });
        }
    }
};
