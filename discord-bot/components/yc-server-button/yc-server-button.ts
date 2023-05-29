import {ButtonBuilder} from '@discordjs/builders';
import {ButtonStyle} from 'discord.js';

import {YcInstanceStatus} from 'api';

// =================================================================
// Префиксы для команд
// =================================================================

export const YC_INSTANCE_START_PREFIX = 'YC-INSTANCE-START-';
export const YC_INSTANCE_STOP_PREFIX = 'YC-INSTANCE-STOP-';

type GetYcCustomIdFromInstanceIdParams = {
    prefix: string;
    ycInstanceId: string;
};

const getYcCustomIdFromInstanceId = ({ycInstanceId, prefix}: GetYcCustomIdFromInstanceIdParams): string => {
    return prefix + ycInstanceId;
};

type GetYcInstanceIdFromCustomIdParams = {
    prefix: string;
    customId: string;
};

export const getYcInstanceIdFromCustomId = ({customId, prefix}: GetYcInstanceIdFromCustomIdParams): string => {
    return customId.replace(prefix, '');
};

type IsCustomIdForYCInstanceParams = {
    prefix: string;
    customId: string;
};

export const isCustomIdForYCInstance = ({customId, prefix}: IsCustomIdForYCInstanceParams): boolean => {
    return customId.startsWith(prefix);
};

// =================================================================
// Сборка компонента
// =================================================================

type GetYCInstanceControlButtonParams = {
    ycInstanceId: string;
    ycInstanceStatus: YcInstanceStatus;
};

export const getYcInstanceControlButton = ({ycInstanceId, ycInstanceStatus}: GetYCInstanceControlButtonParams) => {
    if (ycInstanceStatus === YcInstanceStatus.stopped) {
        return new ButtonBuilder()
            .setLabel(`запустить сервер с id=${ycInstanceId}`)
            .setCustomId(getYcCustomIdFromInstanceId({ycInstanceId, prefix: YC_INSTANCE_START_PREFIX}))
            .setStyle(ButtonStyle.Primary);
    }

    if (ycInstanceStatus === YcInstanceStatus.running) {
        return new ButtonBuilder()
            .setLabel(`остановить сервер с id=${ycInstanceId}`)
            .setCustomId(getYcCustomIdFromInstanceId({ycInstanceId, prefix: YC_INSTANCE_STOP_PREFIX}))
            .setStyle(ButtonStyle.Primary);
    }

    if (ycInstanceStatus === YcInstanceStatus.starting) {
        return new ButtonBuilder()
            .setLabel(`сервер с id=${ycInstanceId} запускается`)
            .setCustomId(getYcCustomIdFromInstanceId({ycInstanceId, prefix: 'starting'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (ycInstanceStatus === YcInstanceStatus.stopping) {
        return new ButtonBuilder()
            .setLabel(`сервер с id=${ycInstanceId} останавливается`)
            .setCustomId(getYcCustomIdFromInstanceId({ycInstanceId, prefix: 'stopping'}))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    return new ButtonBuilder()
        .setLabel(`сервер с id=${ycInstanceId} чиллит`)
        .setCustomId(getYcCustomIdFromInstanceId({ycInstanceId, prefix: 'chill'}))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
};
