import got from 'got';

import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/api-ref/Instance/get
 */

const getGetYcInstanceInfoUrl = (instanceId: string) =>
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}`;

export enum YcInstanceStatus {
    crashed = 'CRASHED',
    deleting = 'DELETING',
    error = 'ERROR',
    provisioning = 'PROVISIONING',
    restarting = 'RESTARTING',
    running = 'RUNNING',
    starting = 'STARTING',
    stopped = 'STOPPED',
    stopping = 'STOPPING',
    updating = 'UPDATING',
    statusUnspecified = 'STATUS_UNSPECIFIED',
}

// Описаны только необходимые типы
interface GetYcInstanceInfoResponse {
    id: string;
    createdAt: string;
    name: string;
    description: string;
    status: YcInstanceStatus;
}

export const getYcInstanceInfo = async (instanceId: string) => {
    try {
        const response = await got
            .get(getGetYcInstanceInfoUrl(instanceId), {
                headers: {
                    'Authorization': `Bearer ${await getIamToken()}`,
                },
                timeout: 10_000,
                retry: {
                    limit: 10,
                },
            })
            .json<GetYcInstanceInfoResponse>()
            .then(({name, status}) => {
                logger.info('Instance info was successfully received');
                return {
                    ycInstanceName: name,
                    ycInstanceStatus: status,
                };
            });
        return response;
    } catch (error) {
        logger.fatal(`Instance info receive was failed for ${instanceId}`);
    }
};
