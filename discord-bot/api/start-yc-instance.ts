import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';
import {requestJson} from './request-json';

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
        await requestJson<StartYcInstanceResponse>(getStartYcInstanceUrl(instanceId), {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
            method: 'POST',
        });
    } catch (error) {
        logger.fatal(`Instance start request was failed for ${instanceId}`);
    }
};
