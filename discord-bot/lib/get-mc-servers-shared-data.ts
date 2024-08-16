import {Secrets, getSecret} from 'lib/get-secret';
import {TimeCach} from 'lib/time-cach';
import {logger} from 'lib/logger';

export type McServersSharedData = {lastTryTime: number};

let mcServersSharedData: TimeCach<Record<string, McServersSharedData>>;

export const getMcServersSharedData = async () => {
    if (mcServersSharedData) {
        return mcServersSharedData;
    }

    const config = await getSecret(Secrets.ycInstanceConfig);

    if (!config) {
        logger.error('config is undefined');
        return;
    }

    mcServersSharedData = new TimeCach(
        config.reduce<Record<string, McServersSharedData>>((acc, {mcServerName}) => {
            acc[mcServerName] = {
                lastTryTime: 0,
            };
            return acc;
        }, {}),
    );

    return mcServersSharedData;
};
