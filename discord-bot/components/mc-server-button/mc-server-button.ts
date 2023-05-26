import {ButtonBuilder} from '@discordjs/builders';
import {ButtonStyle} from 'discord.js';

import {YcInstanceStatus, McServerStatus, McServerId} from 'api';

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
        ycInstanceId: splittedCustomId[1],
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
                `сервер ${serverId.name} запускается` +
                    (isWaitForStarting ? `. TTReap ${timeLeftForRetry ?? -1} сек.` : ''),
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
