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
type StopYcInstanceResponse = {};

export const stopYcInstance = async (instanceId: string) =>
    await got
        .post(getStopYcInstanceUrl(instanceId), {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
            timeout: 10_000,
        })
        .json<StopYcInstanceResponse>()
        .catch(async (e) => {
            logger.fatal('Instance stops request was failed');
            logger.fatal(e);
            process.exit();
        });
