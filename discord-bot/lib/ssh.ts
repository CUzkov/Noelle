import {NodeSSH, Config} from 'node-ssh';

import {logger} from './logger';

type ExecSshCommandParams = {
    command: string;
    cwd?: string;
    config: Config;
};

export const execSshCommand = async ({command, cwd, config}: ExecSshCommandParams) => {
    const ssh = new NodeSSH();

    await ssh.connect(config).then(
        () => logger.info('Succesfully connected to server'),
        (e) => logger.error(e),
    );

    const commResult = await ssh.execCommand(command, {cwd});

    logger.info(commResult.stdout);
    logger.error(commResult.stderr);
};
