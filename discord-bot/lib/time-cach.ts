type TimeCachTech<T> = {
    [Key in keyof T]: {settedTime: number; duration: number};
};

export class TimeCach<Config extends {[Key in keyof Config]: Config[Key]}> {
    private cach: Config;
    private techInfo: TimeCachTech<Config>;

    constructor(initialConfig: Config) {
        this.cach = initialConfig;

        this.techInfo = (Object.keys(initialConfig) as Array<keyof Config>).reduce((acc, curr) => {
            acc[curr] = {settedTime: 0, duration: 0};
            return acc;
        }, {} as Record<keyof Config, {settedTime: number; duration: number}>);
    }

    valueStatus<T extends keyof Config>(key: T) {
        const isExpired =
            Boolean(this.cach[key]) &&
            new Date().getTime() - this.techInfo[key].settedTime > this.techInfo[key].duration;

        return {isExpired};
    }

    set<T extends keyof Config>(key: T, value: Config[T], duration: number) {
        this.techInfo[key] = {duration, settedTime: new Date().getTime()};
        this.cach[key] = value;
    }

    get<T extends keyof Config>(key: T): Config[T] | undefined {
        const {isExpired} = this.valueStatus(key);
        return isExpired ? undefined : this.cach[key];
    }
}
