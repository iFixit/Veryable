import date from 'date-and-time';

export const utils = {
  getDates() {
    let today = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    let yesterday = Math.floor(date.addDays(new Date(), -1).setHours(0, 0, 0, 0) / 1000);
    return [today, yesterday];
  }
}