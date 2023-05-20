import {YcInstanceStatus} from 'api';

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
