import {ActionRowBuilder, EmbedBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';

import {YcInstanceStatus, McServerStatus, McServerInfo} from 'api';
import {getYcInstanceControlButton} from 'components/yc-server-button';
import {getMcServerButton} from 'components/mc-server-button';
import {mapYcInstanceStatusToText} from 'components/yc-server-button/yc-server-button';

type GetServerCardParams = {
    host: string;

    ycInstanceId: string;
    ycInstanceName: string;
    ycInstanceStatus: YcInstanceStatus;

    mcServerName: string;
    mcServerPort: number;
    mcServerInfo: McServerInfo;

    isWaitForStartingMcServer: boolean;
    timeLeftForRetryStartMcServer?: number;
};

export const getServerCard = ({
    host,
    ycInstanceId,
    ycInstanceName,
    ycInstanceStatus,
    mcServerName,
    mcServerPort,
    mcServerInfo,
    isWaitForStartingMcServer,
    timeLeftForRetryStartMcServer,
}: GetServerCardParams) => {
    const ycInstanceButton = getYcInstanceControlButton({instanceId: ycInstanceId, status: ycInstanceStatus});
    const mcServerButton = getMcServerButton({
        ycInstanceStatus,
        serverId: {ycInstanceId, name: mcServerName},
        serverStatus: mcServerInfo.status,
        isWaitForStarting: isWaitForStartingMcServer,
        timeLeftForRetry: timeLeftForRetryStartMcServer,
    });

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
                value: mcServerInfo.status === McServerStatus.running ? 'online' : 'offline',
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

    const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents([
        ycInstanceButton,
        mcServerButton,
    ]);

    return [embed, messageActionRow];
};
