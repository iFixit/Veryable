import date from 'date-and-time';
import moment from 'moment';

export const utils = {
  getDates(): [today:number,yesterday:number] {
    const today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const yesterday = Math.floor(date.addDays(new Date(), -1).setHours(0, 0, 0, 0) / 1000);
    return [today, yesterday];
  },

  getUnixTimeFromISO(iso_date: string): number{
    return moment(iso_date).unix()
  },

  getISOTimeFromUnix(unix_date: number): string{
    return moment(unix_date).toISOString()
  },

  getZeroHourFromDate(unix_date: number): number{
    return moment(unix_date).set({hour: 0, minute: 0, second: 0}).unix()
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