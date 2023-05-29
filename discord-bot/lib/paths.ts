type GetMcServerStatsPathParams = {
    mcServerName: string;
};

export const getMcServerStatsPath = ({mcServerName}: GetMcServerStatsPathParams) => {
    return `/mc-server-statistics/${mcServerName.replace(/\s+/gi, '-').toLocaleLowerCase()}`;
};
