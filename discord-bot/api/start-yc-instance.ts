import got from 'got';
import pRetry, {AbortError} from 'p-retry';

import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/api-ref/Instance/start
 */

const getStartYcInstanceUrl = (instanceId: string) =>
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}:start`;

// Описаны только необходимые типы
interface FetchStartYcInstanceResponse {}

export const fetchStartYcInstance = async (instanceId: string) => {
    try {
        await got
            .post(getStartYcInstanceUrl(instanceId), {
                headers: {
                    'Authorization': `Bearer ${await getIamToken()}`,
                },
                timeout: 10_000,
            })
            .json<FetchStartYcInstanceResponse>();
    } catch (error) {
        logger.fatal(`Instance start request was failed for ${instanceId}`);
        throw new AbortError(error as Error);
    }
};

export const startYcInstance = async (instanceId: string) => {
    const response = await pRetry(() => fetchStartYcInstance(instanceId), {retries: 5});
    return response;
};
