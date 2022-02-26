import {formatISO, getUnixTime, startOfDay, fromUnixTime} from 'date-fns';

export const utils = {
  getUnixTimeFromISO(iso_date: string): number{
    return getUnixTime(new Date(iso_date))
  },

  getISOTimeFromUnix(unix_date: number): string{
    return formatISO(fromUnixTime(unix_date))
  },

  // Will be zeroed to local time -- +8HRS for PST
  getStartOfDayInUnixTime(unix_date: number): number{
    return getUnixTime(startOfDay(fromUnixTime(unix_date)))
  },

  deepCopy<T>(source: T): T {
    return Array.isArray(source)
    ? source.map(item => this.deepCopy(item))
    : source instanceof Date
    ? new Date(source.getTime())
    : source && typeof source === 'object'
          ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
             Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
             o[prop] = this.deepCopy((source as { [key: string]: any })[prop]);
             return o;
          }, Object.create(Object.getPrototypeOf(source)))
    : source as T;
  }
}