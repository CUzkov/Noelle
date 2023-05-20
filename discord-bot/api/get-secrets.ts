import got from 'got';

import {logger, wait, Secrets} from 'lib';

const SECRET_ID = 'e6qpitiokv639bgi5lge';
const GET_SECRET_URL = `https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/${SECRET_ID}/payload`;

type GetSecretsResponse = {
    entries: {key: Secrets; binaryValue?: string; textValue?: string}[];
    versionId: string;
};

export const getSecrets = async ({iam}: {iam: string}) =>
    await got
        .get(GET_SECRET_URL, {
            headers: {
                'Authorization': `Bearer ${iam}`,
            },
        })
        .json<GetSecretsResponse>()
        .then((res) => {
            logger.info('Config secret was successfully received');
            return res;
        })
        .catch(async () => {
            logger.fatal('Config secret receive was failed');
            await wait(1000);
            process.exit();
        });
