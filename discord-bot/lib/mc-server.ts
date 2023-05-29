import {getMcServersSharedData} from 'lib/get-mc-servers-shared-data';

type GetMcServerStartRetryInfoParams = {
    mcServerName: string;
};

export const getMcServerTimeLeftToRetryStart = async ({mcServerName}: GetMcServerStartRetryInfoParams) => {
    const mcServerSharedData = (await getMcServersSharedData()).get(mcServerName);
    const isWaitForStarting = Boolean(mcServerSharedData?.isWaitForStarting);
    const timeLeftForRetry = isWaitForStarting
        ? Math.round((new Date().getTime() - (mcServerSharedData?.lastTryTime ?? 0)) / 1000)
        : 0;

    return timeLeftForRetry;
};
