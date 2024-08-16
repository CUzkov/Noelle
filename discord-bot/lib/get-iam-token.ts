import {getIamToken as getIamTokenApi} from 'api';
import {logger} from 'lib/logger';
import {TimeCach} from 'lib/time-cach';
import {wait} from 'lib/wait';

const HOUR = 60 * 60 * 1_000;

type Config = {
    iam: string;
};

const iamCach = new TimeCach<Config>({
    iam: '',
});

export const getIamToken = async () => {
    let iam = iamCach.get('iam');

    if (!iam) {
        iam = (await getIamTokenApi())?.access_token || '';
        iamCach.set('iam', iam, HOUR);
    }

    iam = iamCach.get('iam');

    if (!iam) {
        logger.fatal('Cannot fetch iam token');
        await wait(1000);
        process.exit();
    }

    return iam;
};
