import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';
import {ButtonStyle} from 'discord.js';

import {YcInstanceStatus, McServerStatus, McServerInfo} from 'api';

type McServerId = {
    name: string;
    ycInstanceId: string;
};

// =================================================================
// Префиксы для команд
// =================================================================

export const MC_SERVER_START_PREFIX = 'MC-INSTANCE-START-';
const MC_SERVER_STOP_PREFIX = 'MC-INSTANCE-STOP-';

const getMcCustomIdFromServerId = ({serverId, prefix}: {serverId: McServerId; prefix: string}): string => {
    return prefix + [serverId.name, serverId.ycInstanceId].join('~');
};

export const getMcServerFromCustomId = ({customId, prefix}: {customId: string; prefix: string}): McServerId => {
    const splittedCustomId = customId.replace(prefix, '').split('~');
    return {
        name: splittedCustomId[0],
        ycInstanceId: splittedCustomId[2],
    };
};

export const isCustomIdForMCServer = ({customId, prefix}: {customId: string; prefix: string}): boolean => {
    return customId.startsWith(prefix);
};

// =================================================================
// Сборка компонента
// =================================================================

export let timeToChangeStatus = new Date().getTime();

type GetMCServerButtonParams = {
    serverId: McServerId;
    serverStatus: McServerStatus;
    ycInstanceStatus: YcInstanceStatus;
    isWaitForStarting: boolean;
    timeLeftForRetry?: number;
};

export const getMcServerButton = ({
    serverStatus,
    serverId,
    ycInstanceStatus,
    isWaitForStarting,
    timeLeftForRetry,
}: GetMCServerButtonParams) => {
    if (ycInstanceStatus !== YcInstanceStatus.running) {
        return new ButtonBuilder()
            .setLabel('для запуска запустите yc сервер')
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: 'yc-not-running'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (serverStatus === McServerStatus.running) {
        return new ButtonBuilder()
            .setLabel(`остановить сервер ${serverId.name}`)
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: MC_SERVER_STOP_PREFIX}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (serverStatus === McServerStatus.intermediate) {
        return new ButtonBuilder()
            .setLabel(
                `сервер ${serverId.name} запускается` + isWaitForStarting
                    ? `. TTReap ${timeLeftForRetry ?? -1_000 / 1000}`
                    : '',
            )
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: 'server-start-runnig'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (serverStatus === McServerStatus.stop) {
        return new ButtonBuilder()
            .setLabel('запустить сервер ' + serverId.name)
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: MC_SERVER_START_PREFIX}))
            .setStyle(ButtonStyle.Primary);
    }

    return new ButtonBuilder()
        .setLabel('сервер ' + serverId.name + ' чиллит')
        .setCustomId(getMcCustomIdFromServerId({serverId, prefix: 'server-chiiiiiled'}))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
};

type GetMcServerComponent = {
    host: string;

    serverName: string;
    serverPort: number;
    serverInfo: McServerInfo;

    ycInstanceId: string;
    ycInstanceStatus: YcInstanceStatus;

    isWaitForStarting: boolean;
    timeLeftForRetry?: number;
};

export const getMcServerComponent = ({
    host,

    serverPort,
    serverName,
    serverInfo,

    ycInstanceId,
    ycInstanceStatus,

    isWaitForStarting,
    timeLeftForRetry,
}: GetMcServerComponent) => {
    const embedYcInstance = new EmbedBuilder()
        .setTitle(`Minecraft server for ${ycInstanceId} yc server`)
        .setThumbnail('https://storage.yandexcloud.net/noelle/server-icon.png')
        .setFields([
            {
                name: serverName,
                value: serverInfo.status === McServerStatus.running ? 'online' : 'offline',
            },
            {
                name: 'Players',
                value:
                    serverInfo.status === McServerStatus.running
                        ? `${serverInfo.playersOnline} / ${serverInfo.maxPlayers}`
                        : '- / -',
                inline: true,
            },
            {
                name: 'Port/Ip',
                value: `${host}:${serverPort}`,
                inline: true,
            },
        ])
        .setTimestamp();

    const messageButton = getMcServerButton({
        serverStatus: serverInfo.status,
        serverId: {name: serverName, ycInstanceId},
        ycInstanceStatus,
        isWaitForStarting,
        timeLeftForRetry,
    });
    const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(messageButton);

    return [embedYcInstance, messageActionRow];
};
