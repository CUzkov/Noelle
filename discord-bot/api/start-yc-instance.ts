import got from 'got';
import {logger, getIamToken} from 'lib';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/api-ref/Instance/start
 */

const getStartYcInstanceUrl = (instanceId: string) =>
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}:start`;

// Описаны только необходимые типы
type StartYcInstanceResponse = {};

export const startYcInstance = async (instanceId: string) =>
    await got
        .get(getStartYcInstanceUrl(instanceId), {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
            timeout: 10_000,
        })
        .json<StartYcInstanceResponse>()
        .catch(async () => {
            logger.fatal('Instance starts request was failed');
            process.exit();
        });
