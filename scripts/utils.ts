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

  getZeroHourFromDate(unix_date: number): number{
    return moment().set({hour: 0, minute: 0, second: 0}).unix()
  }
}