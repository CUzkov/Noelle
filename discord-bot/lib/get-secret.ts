import {logger, TimeCach, wait} from 'lib';
import {getSecrets} from 'api';

// Секреты из yandex lockbox
export enum Secrets {
    discordToken = 'discordToken', // Текстовое значение
    discordClientId = 'discordClientId', // Текстовое значение
    discordStatusChannelId = 'discordStatusChannelId', // Текстовое значение

    ycInstanceConfig = 'ycInstanceConfig', // Бинарное значение
}

export type YcInstanceConfig = {
    host: string;

    ycInstanceId: string;

    login: string;
    privateKey: string;

    startCommand: string;
    mcServerName: string;
    mcServerPort: number;
};

type Config = {
    [Secrets.discordToken]: string;
    [Secrets.discordClientId]: string;
    [Secrets.discordStatusChannelId]: string;

    [Secrets.ycInstanceConfig]: YcInstanceConfig[];
};

const secretsCach = new TimeCach<Config>({
    discordToken: '',
    discordClientId: '',
    discordStatusChannelId: '',

    ycInstanceConfig: [],
});

const FIVE_MINUTS = 5 * 60 * 1_000;

export const getSecret = async <T extends Secrets>(secret: T): Promise<Config[T]> => {
    let cachSecret = secretsCach.get(secret);

    if (!cachSecret) {
        (await getSecrets()).entries.forEach(({key, textValue, binaryValue}) => {
            if (!textValue && !binaryValue) {
                return;
            }

            if (key === Secrets.ycInstanceConfig && binaryValue) {
                try {
                    const ycInstanceConfig: YcInstanceConfig[] = JSON.parse(
                        Buffer.from(binaryValue, 'base64').toString(),
                    );
                    secretsCach.set(key, ycInstanceConfig, FIVE_MINUTS);
                } catch (error) {
                    logger.fatal('Cannot parse yc instances config');
                    process.exit();
                }
                return;
            }

            (textValue || binaryValue) && secretsCach.set(key, textValue ?? binaryValue ?? '', FIVE_MINUTS);
        });
    }

    cachSecret = secretsCach.get(secret);

    if (!cachSecret) {
        logger.fatal(`Cannot fetch ${secret} secret`);
        process.exit();
    }

    return cachSecret;
};
