import got from 'got';

import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/api-ref/Instance/start
 */

const getStartYcInstanceUrl = (instanceId: string) =>
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}:start`;

// Описаны только необходимые типы
interface StartYcInstanceResponse {}

export const startYcInstance = async (instanceId: string) => {
    try {
        await got
            .post(getStartYcInstanceUrl(instanceId), {
                headers: {
                    'Authorization': `Bearer ${await getIamToken()}`,
                },
                timeout: 10_000,
                retry: {
                    limit: 10,
                },
            })
            .json<StartYcInstanceResponse>();
    } catch (error) {
        logger.fatal(`Instance start request was failed for ${instanceId}`);
    }
};
