import got from 'got';

import {logger, TimeCach, wait} from 'lib';

export type Config = {};

enum Secrets {
    iam = 'iam',
    config = 'config',
}

const IAM_TOKEN_REFRESH_URL = 'http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token';
const GET_SECRET_URL = 'https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/e6qvimf47bs3774rjure/payload';
const HOUR = 60 * 60 * 1_000;
const FIVE_MINUTS = 5 * 60 * 1_000;

const secretsCach = new TimeCach();

const refreshIamToken = async () =>
    (
        await got
            .get(IAM_TOKEN_REFRESH_URL, {
                headers: {
                    'Metadata-Flavor': 'Google',
                },
                timeout: 10,
            })
            .json<{
                access_token: string;
            }>()
            .then((res) => {
                logger.info('IAM token was successfully received');
                return res;
            })
            .catch(async () => {
                logger.fatal('IAM token receive was failed');
                await wait(1000);
                process.exit();
            })
    ).access_token;

const getSecretByName = async ({iam}: {iam: string}) =>
    await got
        .get(GET_SECRET_URL, {
            headers: {
                'Authorization': `Bearer ${iam}`,
            },
        })
        .text()
        .then((res) => {
            logger.info('Config secret was successfully received');
            return res;
        })
        .catch(async () => {
            logger.fatal('Config secret receive was failed');
            await wait(1000);
            process.exit();
        });

export const getConfig = async () => {
    let iam = secretsCach.get(Secrets.iam);

    if (!iam) {
        console.log(1);

        iam = await refreshIamToken();
        secretsCach.set(Secrets.iam, iam, HOUR);
    }

    let config = secretsCach.get(Secrets.config);

    if (!config) {
        config = await getSecretByName({iam});
        secretsCach.set(Secrets.config, config, FIVE_MINUTS);
    }

    let parsedConfig: Config;

    try {
        parsedConfig = JSON.parse(config);
    } catch (error) {
        logger.fatal('Config parse was failed');
        wait(1000);
        process.exit();
    }

    return parsedConfig;
};
