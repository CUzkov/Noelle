import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';
import {requestJson} from './request-json';

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
        const {name, status} = await requestJson<GetYcInstanceInfoResponse>(getGetYcInstanceInfoUrl(instanceId), {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
        });
        logger.info('Instance info was successfully received');
        return {
            ycInstanceName: name,
            ycInstanceStatus: status,
        };
    } catch (error) {
        logger.fatal(`Instance info receive was failed for ${instanceId}`);
    }
};
