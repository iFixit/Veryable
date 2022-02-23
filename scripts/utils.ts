import {formatISO, getUnixTime, startOfDay, fromUnixTime} from 'date-fns';

export const utils = {
  getUnixTimeFromISO(iso_date: string): number{
    return getUnixTime(new Date(iso_date))
  },

  getISOTimeFromUnix(unix_date: number): string{
    return formatISO(new Date(unix_date))
  },

  getZeroHourFromDate(unix_date: number): number{
    return getUnixTime(startOfDay(fromUnixTime(unix_date)))
  },

  deepCopy<T>(target: T): T{
    if (target === null) {
      return target;
    }
    if (target instanceof Date) {
      return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
      const cp = [] as any[];
      (target as any[]).forEach((v) => { cp.push(v); });
      return cp.map((n: any) => utils.deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && target !== {}) {
      const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
      Object.keys(cp).forEach(k => {
        cp[k] = utils.deepCopy<any>(cp[k]);
      });
      return cp as T;
    }
    return target;
  },
}