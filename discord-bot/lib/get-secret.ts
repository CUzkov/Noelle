import {logger, TimeCach, wait} from 'lib';
import {getIamToken, getSecrets} from 'api';

// Секреты из yandex lockbox
export enum Secrets {
    iam = 'iam', // Текстовое значение

    discordToken = 'discordToken', // Текстовое значение
    discordClientId = 'discordClientId', // Текстовое значение
    discordStatusChannelId = 'discordStatusChannelId', // Текстовое значение

    yandexCloudToken = 'yandexCloudToken', // Текстовое значение

    mcServerConfig = 'mcServerConfig', // Бинарное значение
}

export type McServerConfig = {};

type Config = {
    [Secrets.iam]: string;

    [Secrets.discordToken]: string;
    [Secrets.discordClientId]: string;
    [Secrets.discordStatusChannelId]: string;

    [Secrets.yandexCloudToken]: string;

    [Secrets.mcServerConfig]: McServerConfig;
};

const secretsCach = new TimeCach<Config>({
    iam: '',

    discordToken: '',
    discordClientId: '',
    discordStatusChannelId: '',

    yandexCloudToken: '',

    mcServerConfig: '',
});

const HOUR = 60 * 60 * 1_000;
const FIVE_MINUTS = 5 * 60 * 1_000;

export const getSecret = async <T extends Secrets>(secret: T): Promise<Config[T]> => {
    let iam = secretsCach.get(Secrets.iam);

    if (!iam) {
        iam = (await getIamToken()).access_token;
        secretsCach.set(Secrets.iam, iam, HOUR);
    }

    let cachSecret = secretsCach.get(secret);

    if (!cachSecret) {
        (await getSecrets({iam})).entries.forEach(({key, textValue, binaryValue}) => {
            if (!textValue && !binaryValue) {
                return;
            }

            if (key === Secrets.mcServerConfig) {
                return;
            }

            (textValue || binaryValue) && secretsCach.set(key, textValue ?? binaryValue ?? '', FIVE_MINUTS);
        });
    }

    cachSecret = secretsCach.get(secret);

    if (!cachSecret) {
        logger.fatal(`Cannot fetch ${secret} secret`);
        await wait(1000);
        process.exit();
    }

    return cachSecret;
};
