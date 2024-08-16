import got from 'got';
import pRetry, {AbortError} from 'p-retry';

import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/operations/vm-connect/auth-inside-vm
 */

const IAM_TOKEN_REFRESH_URL = 'http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token';

interface FetchIamTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

const fetchIamToken = async () => {
    try {
        const response = await got
            .get(IAM_TOKEN_REFRESH_URL, {
                headers: {
                    'Metadata-Flavor': 'Google',
                },
                timeout: 10_000,
            })
            .json<FetchIamTokenResponse>()
            .then((res) => {
                logger.info('IAM token was successfully received');
                return res;
            });
        return response;
    } catch (error) {
        logger.fatal('IAM token receive was failed');
        throw new AbortError(error as Error);
    }
};

export const getIamToken = async () => {
    const response = await pRetry(() => fetchIamToken(), {retries: 5});
    return response;
};
