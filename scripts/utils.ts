import { Maybe } from '@octokit/graphql-schema';
import {DateTime} from 'luxon'

export const utils = {

  getUnixTimeFromISO(iso_date: string): number{
    const date = DateTime.fromISO(iso_date);
    return date.toSeconds()
  },

  getISOTimeFromUnix(unix_date: number): string{
    return DateTime.fromSeconds(unix_date,{zone: 'UTC'}).toISO({suppressMilliseconds: true});
  },

  getStartOfDayInUnixTime(unix_date: number): number{
    return DateTime.fromSeconds(unix_date,{zone: 'UTC'}).startOf('day').toSeconds()
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
  },

  removeMaybeNulls<Type>(unchecked_nodes: Maybe<Maybe<Type>[]> | undefined):Type[] | undefined {
  if (unchecked_nodes) {
    return unchecked_nodes.filter((node): node is Type => {
      return node !== null
    })
  }
}
}