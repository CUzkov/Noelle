import {ping} from 'minecraft-protocol';

export enum McServerStatus {
    stop = 'stop',
    running = 'running',
    intermediate = 'intermediate',
}

export type McServerInfo = {
    status: McServerStatus;
    playersOnline: number;
    maxPlayers: number;
    favicon: string;
};

type GetMcServerStatusParams = {
    host: string;
    serverPort: number;
};

export const getMcServerStatus = async ({host, serverPort}: GetMcServerStatusParams) => {
    const info: McServerInfo = {
        status: McServerStatus.intermediate,
        maxPlayers: 0,
        playersOnline: 0,
        favicon: '',
    };

    try {
        const result = await ping({
            host,
            port: serverPort,
        });

        if ('description' in result) {
            info.status = McServerStatus.running;
            info.maxPlayers = result.players.max;
            info.playersOnline = result.players.online;
            info.favicon = result.favicon ?? '';
        }
    } catch (error) {
        // offline
        info.status = McServerStatus.stop;
    }

    return info;
};
