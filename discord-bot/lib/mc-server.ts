import {getMcServersSharedData} from 'lib/get-mc-servers-shared-data';

type GetMcServerStartRetryInfoParams = {
    mcServerName: string;
};

export const getMcServerTimeLeftToRetryStart = async ({mcServerName}: GetMcServerStartRetryInfoParams) => {
    const mcServerSharedData = (await getMcServersSharedData()).get(mcServerName);

    const timeLeftForRetry = mcServerSharedData
        ? Math.round((new Date().getTime() - mcServerSharedData.lastTryTime) / 1000)
        : 0;

    return timeLeftForRetry;
};
