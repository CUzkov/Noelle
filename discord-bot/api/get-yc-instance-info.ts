import got from 'got';
import {logger, getIamToken} from 'lib';

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
type GetYcInstanceInfoResponse = {
    id: string;
    createdAt: string;
    name: string;
    description: string;
    status: YcInstanceStatus;
};

export const getYcInstanceInfoUrl = async (instanceId: string) =>
    await got
        .get(getGetYcInstanceInfoUrl(instanceId), {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
            timeout: 10_000,
        })
        .json<GetYcInstanceInfoResponse>()
        .catch(async () => {
            logger.fatal('Instance info receive was failed');
            process.exit();
        });
