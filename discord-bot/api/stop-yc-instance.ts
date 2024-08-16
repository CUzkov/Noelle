import got from 'got';

import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/api-ref/Instance/stop
 */

const getStopYcInstanceUrl = (instanceId: string) =>
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}:stop`;

// Описаны только необходимые типы
interface StopYcInstanceResponse {}

export const stopYcInstance = async (instanceId: string) => {
    try {
        await got
            .post(getStopYcInstanceUrl(instanceId), {
                headers: {
                    'Authorization': `Bearer ${await getIamToken()}`,
                },
                timeout: 10_000,
                retry: {
                    limit: 10,
                },
            })
            .json<StopYcInstanceResponse>();
    } catch (error) {
        logger.fatal(`Instance stop request was failed for ${instanceId}`);
    }
};
