import {NodeSSH, Config, SSHExecCommandOptions} from 'node-ssh';

import {logger} from './logger';

type ExecSshCommandParams = {
    command: string;
    config: Config;
    options?: SSHExecCommandOptions;
};

export const execSshCommand = async ({command, options, config}: ExecSshCommandParams) => {
    const ssh = new NodeSSH();

    await ssh.connect(config).then(
        () => logger.info('Succesfully connected to server'),
        (e) => logger.error(e),
    );

    const commResult = await ssh.execCommand(command, options);

    logger.info(commResult.stdout);
    logger.error(commResult.stderr);
};
