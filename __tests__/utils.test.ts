import { utils } from '../scripts/utils'

const iso_date = "2022-02-28T19:31:33Z"
const unix_time = 1646076693
const zeroed_time = 1646006400

describe('Validate Util Date Functions', () => {
  test('Get Unix Time from ISO Date', () => {
    expect(utils.getUnixTimeFromISO(iso_date)).toBe(unix_time)
  })

  test('Get ISO Date from Unix Time', () => {
    expect(utils.getISOTimeFromUnix(unix_time)).toBe(iso_date)
  })

  test('Get Zeroed Hour of Day in Unix Time', () => {
    expect(utils.getStartOfDayInUnixTime(unix_time)).toBe(zeroed_time)
  })
})