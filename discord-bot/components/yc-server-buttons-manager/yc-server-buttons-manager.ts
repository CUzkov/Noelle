import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';

import {mapYcInstanceStatusToText} from 'consts';
import {YcInstanceStatus} from 'api';
import {ButtonStyle} from 'discord.js';

// =================================================================
// Префиксы для команд
// =================================================================

export const YC_INSTANCE_START_PREFIX = 'YC-INSTANCE-START-';
const YC_INSTANCE_STOP_PREFIX = 'YC-INSTANCE-STOP-';

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
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    if (status === YcInstanceStatus.stopping) {
        return new ButtonBuilder()
            .setLabel(`сервер с id=${instanceId} останавливается`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
    }

    return new ButtonBuilder()
        .setLabel(`сервер с id=${instanceId} чиллит`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
};

type GetYCInstanceComponent = {
    status: YcInstanceStatus;
    instanceId: string;
    instanceName: string;
};

export const getYCInstanceComponent = ({status, instanceId, instanceName}: GetYCInstanceComponent) => {
    const embedYcInstance = new EmbedBuilder()
        .setTitle(`YC server status for ${instanceName} yc server`)
        .setThumbnail('https://storage.yandexcloud.net/noelle/server-icon.png')
        .setFields([
            {
                name: 'Status',
                value: mapYcInstanceStatusToText[status],
                inline: true,
            },
            {
                name: 'ID',
                value: instanceId,
                inline: true,
            },
        ])
        .setTimestamp();

    const messageButton = getYcInstanceControlButton({status, instanceId});
    const messageActionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(messageButton);

    return [embedYcInstance, messageActionRow];
};
