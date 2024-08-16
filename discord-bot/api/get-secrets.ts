import got from 'got';
import pRetry, {AbortError} from 'p-retry';

import {Secrets} from 'lib/get-secret';
import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/lockbox/api-ref/Payload/get
 */

const SECRET_ID = 'e6qpitiokv639bgi5lge';
const GET_SECRET_URL = `https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/${SECRET_ID}/payload`;

interface FetchSecretsResponse {
    entries: {key: Secrets; binaryValue?: string; textValue?: string}[];
    versionId: string;
}

const fetchSecrets = async () => {
    try {
        const response = await got
            .get(GET_SECRET_URL, {
                headers: {
                    'Authorization': `Bearer ${await getIamToken()}`,
                },
                timeout: 10_000,
            })
            .json<FetchSecretsResponse>()
            .then((res) => {
                logger.info('Config secret was successfully received');
                return res;
            });
        return response;
    } catch (error) {
        logger.fatal('Config secret receive was failed');
        throw new AbortError(error as Error);
    }
};

export const getSecrets = async () => {
    const response = await pRetry(() => fetchSecrets(), {retries: 5});
    return response;
};
