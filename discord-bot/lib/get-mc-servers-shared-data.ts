import {Secrets, TimeCach, getSecret} from 'lib';

export type McServersSharedData = {isWaitForStarting: boolean; lastTryTime: number};

let mcServersSharedData: TimeCach<Record<string, McServersSharedData>>;

export const getMcServersSharedData = async () => {
    if (mcServersSharedData) {
        return mcServersSharedData;
    }

    const config = await getSecret(Secrets.ycInstanceConfig);

    mcServersSharedData = new TimeCach(
        config.reduce((acc, {mcServerName}) => {
            acc[mcServerName] = {
                isWaitForStarting: false,
                lastTryTime: 0,
            };
            return acc;
        }, {} as Record<string, McServersSharedData>),
    );

    return mcServersSharedData;
};
