import {ActionRowBuilder, EmbedBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';

import {YcInstanceStatus, McServerStatus, McServerInfo} from 'api';
import {getYcInstanceControlButton} from 'components/yc-server-button';
import {getMcServerButton} from 'components/mc-server-button';

const mapYcInstanceStatusToText: Record<YcInstanceStatus, string> = {
    [YcInstanceStatus.crashed]: '🔴 Сервер крашнулся',
    [YcInstanceStatus.deleting]: '🔴 Сервер удаляется',
    [YcInstanceStatus.error]: '🔴 Сервер ошибся',
    [YcInstanceStatus.provisioning]: '🟡 Сервер запускается',
    [YcInstanceStatus.restarting]: '🟡 Сервер перезагружается',
    [YcInstanceStatus.running]: '🟢 Сервер запущен',
    [YcInstanceStatus.starting]: '🟡 Сервер запускается',
    [YcInstanceStatus.stopped]: '🔴 Сервер остановлен',
    [YcInstanceStatus.stopping]: '🔴 Сервер останавливается',
    [YcInstanceStatus.updating]: '🟡 Сервер обновляется',
    [YcInstanceStatus.statusUnspecified]: '🔴 GG',
};

const mapMcServerStatusToText: Record<McServerStatus, string> = {
    [McServerStatus.intermediate]: '🟡 Сервер запускается',
    [McServerStatus.stop]: '🔴 Сервер остановлен',
    [McServerStatus.running]: '🟢 Сервер запущен',
};

type GetServerCardButtonParams = {
    ycInstanceId: string;
    ycInstanceName: string;
    ycInstanceStatus: YcInstanceStatus;

    mcServerName: string;
    mcServerInfo: McServerInfo;

    mcServertimeLeftForRetryStart: number;
};

export const getServerCardButtons = ({
    ycInstanceId,
    ycInstanceStatus,
    mcServerName,
    mcServerInfo,
    mcServertimeLeftForRetryStart,
}: GetServerCardButtonParams) => {
    const ycInstanceButton = getYcInstanceControlButton({ycInstanceId, ycInstanceStatus});
    const mcServerButton = getMcServerButton({
        ycInstanceId,
        ycInstanceStatus,
        mcServerName,
        mcServerInfo,
        mcServertimeLeftForRetryStart,
    });

    return new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents([ycInstanceButton, mcServerButton]);
};

type GetServerCardParams = {
    host: string;

    ycInstanceId: string;
    ycInstanceName: string;
    ycInstanceStatus: YcInstanceStatus;

    mcServerName: string;
    mcServerPort: number;
    mcServerInfo: McServerInfo;

    mcServertimeLeftForRetryStart: number;
};

export const getServerCard = ({
    host,
    ycInstanceId,
    ycInstanceName,
    ycInstanceStatus,
    mcServerName,
    mcServerPort,
    mcServerInfo,
    mcServertimeLeftForRetryStart,
}: GetServerCardParams) => {
    const embed = new EmbedBuilder()
        .setTitle(`Server card for mc server "${mcServerName}", yc server ${ycInstanceId}`)
        .setThumbnail('https://storage.yandexcloud.net/noelle/server-icon.png')
        .setFields([
            // Yc fields
            {
                name: 'Yc server info',
                value: `Name - ${ycInstanceName}, ID - ${ycInstanceId}`,
            },
            {
                name: 'Status',
                value: mapYcInstanceStatusToText[ycInstanceStatus],
                inline: true,
            },
            {
                name: 'ID',
                value: ycInstanceId,
                inline: true,
            },

            // Mc fields
            {
                name: 'Mc server info',
                value: mcServerName,
            },
            {
                name: 'Status',
                value: mapMcServerStatusToText[mcServerInfo.status],
                inline: true,
            },
            {
                name: 'Players',
                value:
                    mcServerInfo.status === McServerStatus.running
                        ? `${mcServerInfo.playersOnline} / ${mcServerInfo.maxPlayers}`
                        : '- / -',
                inline: true,
            },
            {
                name: 'Port/Ip',
                value: `${host}:${mcServerPort}`,
                inline: true,
            },
        ])
        .setTimestamp();

    const buttons = getServerCardButtons({
        ycInstanceId,
        ycInstanceName,
        ycInstanceStatus,
        mcServerName,
        mcServerInfo,
        mcServertimeLeftForRetryStart,
    });

    return [embed, buttons];
};
