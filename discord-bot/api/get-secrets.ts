import got from 'got';

import {Secrets} from 'lib/get-secret';
import {getIamToken} from 'lib/get-iam-token';
import {logger} from 'lib/logger';

/**
 * Описание ручки в документации
 * https://cloud.yandex.ru/docs/lockbox/api-ref/Payload/get
 */

const SECRET_ID = 'e6qpitiokv639bgi5lge';
const GET_SECRET_URL = `https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/${SECRET_ID}/payload`;

type GetSecretsResponse = {
    entries: {key: Secrets; binaryValue?: string; textValue?: string}[];
    versionId: string;
};

export const getSecrets = async () =>
    await got
        .get(GET_SECRET_URL, {
            headers: {
                'Authorization': `Bearer ${await getIamToken()}`,
            },
            timeout: 10_000,
        })
        .json<GetSecretsResponse>()
        .then((res) => {
            logger.info('Config secret was successfully received');
            return res;
        })
        .catch(async (e) => {
            logger.fatal('Config secret receive was failed');
            logger.fatal(e);
            process.exit();
        });
