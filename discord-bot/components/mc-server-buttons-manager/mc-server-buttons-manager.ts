import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';
import {ButtonStyle} from 'discord.js';

import {YcInstanceStatus} from 'api';

export enum McServerStatus {
    stop = 'stop',
    running = 'running',
    intermediate = 'intermediate',
}

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
};

const getMCServerButton = ({serverStatus, serverId, ycInstanceStatus}: GetMCServerButtonParams) => {
    const now = new Date().getTime();

    let status = serverStatus;
    let timeToPrint = '';

    if (now < timeToChangeStatus) {
        status = McServerStatus.intermediate;
        timeToPrint = '. TTReap ' + Math.round((timeToChangeStatus - now) / (1000 * 60));
    } else {
        // lastStatus = serverStatus;
    }

    if (ycInstanceStatus !== YcInstanceStatus.running) {
        return new ButtonBuilder()
            .setLabel('для запуска запустите yc сервер')
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: 'yc-not-running'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (status === McServerStatus.running) {
        return new ButtonBuilder()
            .setLabel('остановить сервер ' + serverId.name)
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: MC_SERVER_STOP_PREFIX}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (status === McServerStatus.intermediate) {
        return new ButtonBuilder()
            .setLabel('сервер ' + serverId.name + ' запускается ' + timeToPrint)
            .setCustomId(getMcCustomIdFromServerId({serverId, prefix: 'server-start-runnig'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (status === McServerStatus.stop) {
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
    ycInstanceId: string;
    serverName: string;
    serverStatus: McServerStatus;
    ycInstanceStatus: YcInstanceStatus;
};

export const getMcServerComponent = ({
    ycInstanceId,
    serverStatus,
    serverName,
    ycInstanceStatus,
}: GetMcServerComponent) => {
    const embedYcInstance = new EmbedBuilder()
        .setTitle(`Minecraft server statuses for ${ycInstanceId} yc server`)
        .setThumbnail('https://storage.yandexcloud.net/noelle/server-icon.png')
        .setFields([
            {
                name: serverName,
                value: serverStatus === McServerStatus.running ? 'online' : 'offline',
            },
            {
                name: 'Players',
                value: serverStatus === McServerStatus.running ? 'players' : '- / -',
                inline: true,
            },
            {
                name: 'Port/Ip',
                value: '${serverIp}:${serverPort}',
                inline: true,
            },
        ])
        .setTimestamp();

    const messageButton = getMCServerButton({
        serverStatus,
        serverId: {name: serverName, ycInstanceId},
        ycInstanceStatus,
    });
    const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(messageButton);

    return [embedYcInstance, messageActionRow];
};
