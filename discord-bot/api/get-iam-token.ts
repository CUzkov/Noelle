import got from 'got';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/compute/operations/vm-connect/auth-inside-vm
 */

const IAM_TOKEN_REFRESH_URL = 'http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token';

type GetIamTokenResponse = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export const getIamToken = async () =>
    await got
        .get(IAM_TOKEN_REFRESH_URL, {
            headers: {
                'Metadata-Flavor': 'Google',
            },
            timeout: 10_000,
        })
        .json<GetIamTokenResponse>()
        .then((res) => {
            logger.info('IAM token was successfully received');
            return res;
        })
        .catch(async (e) => {
            logger.fatal('IAM token receive was failed');
            logger.fatal(e);
            process.exit();
        });
