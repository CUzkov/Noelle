import Rsync from 'rsync';

import { Secrets, getSecret, wait } from "lib";

export const syncMcStatistics = async () => {
    while (true) {
        await wait(15_000);

        const config = await getSecret(Secrets.ycInstanceConfig);

        for (let i = 0; i < config.length; i++) {
            const {mcServerStatsPath} = config[i];
            
            
        }
    }
};
