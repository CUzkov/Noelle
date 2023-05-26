import {ButtonBuilder} from '@discordjs/builders';
import {ButtonStyle} from 'discord.js';

import {YcInstanceStatus} from 'api';

// =================================================================
// Префиксы для команд
// =================================================================

export const YC_INSTANCE_START_PREFIX = 'YC-INSTANCE-START-';
export const YC_INSTANCE_STOP_PREFIX = 'YC-INSTANCE-STOP-';

const getYCCustomIdFromInstanceId = ({instanceId, prefix}: {instanceId: string; prefix: string}): string => {
    return prefix + instanceId;
};

export const getYCInstanceIdFromCustomId = ({customId, prefix}: {customId: string; prefix: string}): string => {
    return customId.replace(prefix, '');
};

export const isCustomIdForYCInstance = ({customId, prefix}: {customId: string; prefix: string}): boolean => {
    return customId.startsWith(prefix);
};

// =================================================================
// Сборка компонента
// =================================================================

export const mapYcInstanceStatusToText: Record<YcInstanceStatus, string> = {
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

type GetYCInstanceControlButtonParams = {
    status: YcInstanceStatus;
    instanceId: string;
};

export const getYcInstanceControlButton = ({status, instanceId}: GetYCInstanceControlButtonParams) => {
    if (status === YcInstanceStatus.stopped) {
        return new ButtonBuilder()
            .setLabel(`запустить сервер с id=${instanceId}`)
            .setCustomId(getYCCustomIdFromInstanceId({instanceId, prefix: YC_INSTANCE_START_PREFIX}))
            .setStyle(ButtonStyle.Primary);
    }

    if (status === YcInstanceStatus.running) {
        return new ButtonBuilder()
            .setLabel(`остановить сервер с id=${instanceId}`)
            .setCustomId(getYCCustomIdFromInstanceId({instanceId, prefix: YC_INSTANCE_STOP_PREFIX}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (status === YcInstanceStatus.starting) {
        return new ButtonBuilder()
            .setLabel(`сервер с id=${instanceId} запускается`)
            .setCustomId(getYCCustomIdFromInstanceId({instanceId, prefix: 'starting'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (status === YcInstanceStatus.stopping) {
        return new ButtonBuilder()
            .setLabel(`сервер с id=${instanceId} останавливается`)
            .setCustomId(getYCCustomIdFromInstanceId({instanceId, prefix: 'stopping'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    return new ButtonBuilder()
        .setLabel(`сервер с id=${instanceId} чиллит`)
        .setCustomId(getYCCustomIdFromInstanceId({instanceId, prefix: 'chill'}))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
};
