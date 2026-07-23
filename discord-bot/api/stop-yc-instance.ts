import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';
import {requestJson} from './request-json';

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
        await requestJson<StopYcInstanceResponse>(getStopYcInstanceUrl(instanceId), {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
            method: 'POST',
        });
    } catch (error) {
        logger.fatal(`Instance stop request was failed for ${instanceId}`);
    }
};
