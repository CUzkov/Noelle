import {ButtonBuilder} from '@discordjs/builders';
import {ButtonStyle} from 'discord.js';

import {YcInstanceStatus, McServerStatus, McServerInfo} from 'api';

// =================================================================
// Префиксы для команд
// =================================================================

export const MC_SERVER_START_PREFIX = 'MC-INSTANCE-START-';
const MC_SERVER_STOP_PREFIX = 'MC-INSTANCE-STOP-';

type GetMcCustomIdFromServerIdParams = {
    prefix: string;
    ycInstanceId: string;
    mcServerName: string;
};

const getMcCustomIdFromServerId = ({prefix, ycInstanceId, mcServerName}: GetMcCustomIdFromServerIdParams): string => {
    return prefix + [mcServerName, ycInstanceId].join('~');
};

type GetMcServerFromCustomIdParams = {
    customId: string;
    prefix: string;
};

export const getMcServerFromCustomId = ({
    customId,
    prefix,
}: GetMcServerFromCustomIdParams): {ycInstanceId: string; mcServerName: string} => {
    const splittedCustomId = customId.replace(prefix, '').split('~');
    return {
        mcServerName: splittedCustomId[0],
        ycInstanceId: splittedCustomId[1],
    };
};

type IsCustomIdForMCServerParams = {
    customId: string;
    prefix: string;
};

export const isCustomIdForMCServer = ({customId, prefix}: IsCustomIdForMCServerParams): boolean => {
    return customId.startsWith(prefix);
};

// =================================================================
// Сборка компонента
// =================================================================

export let timeToChangeStatus = new Date().getTime();

type GetMCServerButtonParams = {
    ycInstanceId: string;
    ycInstanceStatus: YcInstanceStatus;

    mcServerName: string;
    mcServerInfo: McServerInfo;
    mcServertimeLeftForRetryStart: number;
};

export const getMcServerButton = ({
    ycInstanceId,
    ycInstanceStatus,

    mcServerName,
    mcServerInfo,
    mcServertimeLeftForRetryStart,
}: GetMCServerButtonParams) => {
    const mcServerStatus = mcServerInfo.status;

    if (ycInstanceStatus !== YcInstanceStatus.running) {
        return new ButtonBuilder()
            .setLabel('для запуска запустите yc сервер')
            .setCustomId(getMcCustomIdFromServerId({prefix: 'yc-not-running', ycInstanceId, mcServerName}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (mcServerStatus === McServerStatus.running) {
        return new ButtonBuilder()
            .setLabel(`остановить сервер ${mcServerName}`)
            .setCustomId(getMcCustomIdFromServerId({prefix: MC_SERVER_STOP_PREFIX, ycInstanceId, mcServerName}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (mcServerStatus === McServerStatus.intermediate) {
        return new ButtonBuilder()
            .setLabel(
                `сервер ${mcServerName} запускается` +
                    (mcServertimeLeftForRetryStart > 0 ? `. TTReap ${mcServertimeLeftForRetryStart} сек.` : ''),
            )
            .setCustomId(getMcCustomIdFromServerId({prefix: 'server-start-runnig', ycInstanceId, mcServerName}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (mcServerStatus === McServerStatus.stop) {
        return new ButtonBuilder()
            .setLabel(`запустить сервер ${mcServerName}`)
            .setCustomId(getMcCustomIdFromServerId({prefix: MC_SERVER_START_PREFIX, ycInstanceId, mcServerName}))
            .setStyle(ButtonStyle.Primary);
    }

    return new ButtonBuilder()
        .setLabel(`сервер ${mcServerName} чиллит`)
        .setCustomId(getMcCustomIdFromServerId({prefix: 'server-chiiiiiled', ycInstanceId, mcServerName}))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
};
