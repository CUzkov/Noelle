import got from 'got';
import pRetry, {AbortError} from 'p-retry';

import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/api-ref/Instance/stop
 */

const getStopYcInstanceUrl = (instanceId: string) =>
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}:stop`;

// Описаны только необходимые типы
interface FetchStopYcInstanceResponse {}

export const fetchStopYcInstance = async (instanceId: string) => {
    try {
        await got
            .post(getStopYcInstanceUrl(instanceId), {
                headers: {
                    'Authorization': `Bearer ${await getIamToken()}`,
                },
                timeout: 10_000,
            })
            .json<FetchStopYcInstanceResponse>();
    } catch (error) {
        logger.fatal(`Instance stop request was failed for ${instanceId}`);
        throw new AbortError(error as Error);
    }
};

export const stopYcInstance = async (instanceId: string) => {
    const response = await pRetry(() => fetchStopYcInstance(instanceId), {retries: 5});
    return response;
};
