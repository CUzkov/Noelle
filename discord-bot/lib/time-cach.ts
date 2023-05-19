export class TimeCach {
    private cach: Record<string, {settedTime: number; duration: number; value: string}> = {};

    valueStatus(key: string) {
        const isExpired =
            Boolean(this.cach[key]) && new Date().getTime() - this.cach[key].settedTime > this.cach[key].duration;

        return {isExpired};
    }

    set(key: string, value: string, duration: number) {
        this.cach[key] = {value, duration, settedTime: new Date().getTime()};
    }

    get(key: string) {
        const {isExpired} = this.valueStatus(key);
        return isExpired ? '' : this.cach[key]?.value ?? '';
    }
}
